# Quick Deployment Reference

One-liner deployment commands for each platform.

## Railway.app

```bash
git push origin main
# Auto-deploys via GitHub webhook
# Check dashboard at https://railway.app
```

## PM2

**Windows:**
```bash
./start-pm2.bat
```

**Linux/macOS:**
```bash
chmod +x start-pm2.sh
./start-pm2.sh
```

**Manual:**
```bash
npm install -g pm2
npm install --only=production
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**View Logs:**
```bash
pm2 logs discord-economy-bot
```

**Restart:**
```bash
pm2 restart discord-economy-bot
```

## Docker

**Start:**
```bash
docker-compose up -d
```

**View Logs:**
```bash
docker-compose logs -f discord-bot
```

**Stop:**
```bash
docker-compose down
```

**Rebuild:**
```bash
docker-compose up -d --build
```

## Systemd (Linux)

**Install:**
```bash
sudo cp discord-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable discord-bot
sudo systemctl start discord-bot
```

**View Logs:**
```bash
sudo journalctl -u discord-bot -f
```

**Restart:**
```bash
sudo systemctl restart discord-bot
```

---

## Environment Variables

All platforms require `.env`:

```env
DISCORD_TOKEN=your-bot-token
CLIENT_ID=your-app-id
GUILD_ID=your-server-id
DATABASE_PATH=./database/data.sqlite
```

Railway: Set these in Dashboard → Variables  
PM2: Create `.env` file locally  
Docker: Use `.env` file (bind-mounted)  
Systemd: Create `.env` file in bot directory  

---

## Database Backup

```bash
# Local
cp database/data.sqlite database/data.sqlite.backup

# Docker
docker-compose exec discord-bot cp database/data.sqlite database/data.sqlite.backup

# PM2
cp database/data.sqlite database/data.sqlite.backup

# Systemd
sudo cp /home/discord-bot/discord-economy-bot/database/data.sqlite ~/backup.sqlite
```

---

## Logs Location

| Platform | Log Path |
|----------|----------|
| PM2 | `logs/out.log`, `logs/err.log` |
| Docker | `docker logs discord-bot` |
| Systemd | `sudo journalctl -u discord-bot` |
| Railway | Dashboard → Deployments → Logs |

---

## Health Check

```bash
# Verify bot is online
curl -s https://discord.com/api/v10/applications/YOUR_CLIENT_ID/commands \
  -H "Authorization: Bot YOUR_TOKEN" | jq 'length'
# Should return number of registered commands
```

---

## Troubleshooting

**Bot won't start:**
```bash
node src/index.js
# Check for syntax errors
```

**Database corrupted:**
```bash
rm database/data.sqlite
npm start
# Bot will recreate schema
```

**Port conflicts (not used here, but for reference):**
```bash
# Find process using port 3000
lsof -i :3000
```

**Memory issues:**
```bash
# Restart PM2 process
pm2 restart discord-economy-bot

# Restart Docker container
docker-compose restart discord-bot

# Restart systemd service
sudo systemctl restart discord-bot
```
