// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');
const axios = require('axios');
const path = require('path');

const app = express();
const db = new Database('reports.db');
const SECRET_KEY = process.env.SECRET_KEY || 'CHAVE_SECRETA_COMPARTILHADA';
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || '';
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

db.prepare(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    placeId INTEGER,
    jobId TEXT,
    timestamp INTEGER,
    serverPlayers INTEGER,
    modelName TEXT,
    fullPath TEXT
)`).run();

const insert = db.prepare(`INSERT INTO reports (placeId, jobId, timestamp, serverPlayers, modelName, fullPath) VALUES (?, ?, ?, ?, ?, ?)`);

app.post('/api/report', async (req, res) => {
    try {
        const { secret, payload } = req.body;
        if (secret !== SECRET_KEY) return res.status(401).json({ error: 'Unauthorized' });
        if (!payload || !payload.jobId || !payload.reports) return res.status(400).json({ error: 'Bad payload' });

        const now = payload.timestamp || Math.floor(Date.now() / 1000);
        for (const r of payload.reports) {
            insert.run(payload.placeId, payload.jobId, now, payload.serverPlayers || 0, r.Nome || r.modelName, r.Caminho || r.fullPath);
        }

        if (DISCORD_WEBHOOK) {
            try {
                const modelos = payload.reports.map(x => x.Nome || x.modelName).join(', ');
                const link = `https://www.roblox.com/games/${payload.placeId}/server/${payload.jobId}`;
                await axios.post(DISCORD_WEBHOOK, {
                    content: `🧠 **Modelos encontrados:** ${modelos}\n🔗 **Servidor:** ${link}\n👥 **Players:** ${payload.serverPlayers || 0}`
                });
            } catch (e) {
                console.warn('Falha ao enviar webhook:', e.message);
            }
        }

        return res.json({ status: 'ok' });
    } catch (e) {
        console.error('Erro /api/report:', e);
        return res.status(500).json({ error: 'server error' });
    }
});

app.get('/api/servers', (req, res) => {
    const rows = db.prepare(`
        SELECT jobId, placeId, serverPlayers, MAX(timestamp) as lastSeen, GROUP_CONCAT(DISTINCT modelName) as models, COUNT(*) as hits
        FROM reports GROUP BY jobId ORDER BY lastSeen DESC LIMIT 500
    `).all();
    res.json(rows);
});

app.get('/api/server/:jobId', (req, res) => {
    const rows = db.prepare(`SELECT * FROM reports WHERE jobId = ? ORDER BY timestamp DESC`).all(req.params.jobId);
    res.json(rows);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui.html'));
});

app.listen(PORT, () => console.log('Server running on port', PORT));
