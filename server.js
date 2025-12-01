const express = require('express');
const cors = require('cors');
const betterSqlite3 = require('better-sqlite3');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({limit: '10mb'}));

const db = new betterSqlite3('brainrot.db');
db.exec(`CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jobId TEXT,
  placeId INTEGER,
  timestamp INTEGER,
  players INTEGER,
  models TEXT
)`);

const SECRET = "x7k9p2m8q5r3t1v6w4y0z9a8b7c6d5e4f3g2h1j0";

app.post('/api/report', (req, res) => {
  if (req.body.secret !== SECRET) return res.status(403).send("no");
  const {jobId, placeId, timestamp, serverPlayers, reports} = req.body.payload;
  const models = reports.map(r => typeof r === 'object' ? r.Nome : r).join(' | ');
  
  db.prepare(`INSERT INTO reports (jobId, placeId, timestamp, players, models) VALUES (?, ?, ?, ?, ?)`)
    .run(jobId, placeId, timestamp, serverPlayers, models);
  
  res.send("ok");
});

app.get('/api/servers', (req, res) => {
  const rows = db.prepare(`SELECT jobId, models, players, timestamp FROM reports WHERE timestamp > ? ORDER BY timestamp DESC`)
                .all(Date.now()/1000 - 300); // 5 dernières minutes
  res.json(rows);
});

app.get('*', (req, res) => {
  res.send(`
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Brainrot Finder</title>
    <style>body{font-family:Arial;background:#111;color:#0f0;text-align:center;padding:20px;}</style>
    <h1>Brainrot Finder RENDER – LIVE</h1>
    <div id="list"></div>
    <script>
      setInterval(() => {
        fetch('/api/servers').then(r=>r.json()).then(d=>{
          document.getElementById('list').innerHTML = d.map(s=>`
            <div style="margin:10px;padding:15px;background:#222;border:2px solid #0f0;">
              <b>${s.models}</b><br>
              ${s.players} joueurs • il y a ${Math.round((Date.now()/1000 - s.timestamp))}s
              <button onclick="navigator.clipboard.writeText('${s.jobId}')">Copier jobId</button>
            </div>`).join('');
        });
      }, 3000);
    </script>
  `);
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log('Brainrot Finder RENDER up'));
