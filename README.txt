Brainrot Finder - README

Arquivos:
- reporter.lua       -> Script para colocar em ServerScriptService (Roblox)
- server.js          -> Backend Node.js (Express)
- ui.html            -> Interface web
- .env.example       -> Exemplo de variáveis de ambiente

Instalação backend:
1. npm init -y
2. npm install express better-sqlite3 body-parser cors dotenv axios
3. Copie .env.example para .env e configure SECRET_KEY e DISCORD_WEBHOOK (opcional)
4. Coloque server.js e ui.html no mesmo diretório
5. node server.js
6. Abra http://localhost:3000

Configuração Roblox:
1. Abra Roblox Studio no jogo que você controla.
2. Em Game Settings -> Security -> Allow HTTP Requests -> ON
3. Cole reporter.lua em ServerScriptService.
4. Ajuste BACKEND_URL (ex: https://seu-dominio.com/api/report) e SECRET_KEY iguais ao backend.
5. Publique o jogo.

Observações:
- Use apenas em jogos que você tem permissão / propriedade.
- Não automatize logins ou crie bots que entrem em massa — isso viola os ToS do Roblox.
- Para produção, hospede o backend em um serviço com HTTPS (Render, Railway, VPS).
