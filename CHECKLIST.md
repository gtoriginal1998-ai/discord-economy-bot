# Pre-Deployment Checklist

Before deploying your Discord bot, ensure everything is configured correctly.

## Discord Bot Setup

- [ ] Bot is created in [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] Bot token is in `.env` as `DISCORD_TOKEN`
- [ ] Bot has required intents enabled:
  - [ ] Guilds
  - [ ] Guild Messages
  - [ ] Guild Members
  - [ ] Message Content
- [ ] Bot is invited to your test server with these permissions:
  - [ ] View Channels
  - [ ] Send Messages
  - [ ] Embed Links
  - [ ] Attach Files
  - [ ] Read Message History
  - [ ] Add Reactions

## Environment Variables

- [ ] `DISCORD_TOKEN` is set and valid
- [ ] `CLIENT_ID` is set and matches your app ID
- [ ] `GUILD_ID` is set to your test server ID
- [ ] `DATABASE_PATH` is set (defaults to `./database/data.sqlite`)
- [ ] `ADMIN_ROLE_ID` is set (optional, for admin commands)

## Local Testing

Before deploying:

```bash
npm install
npm run deploy
npm start
```

- [ ] Bot logs in successfully
- [ ] "Logged in as [BotName]#xxxx" appears in console
- [ ] Slash commands are registered (check with `/` in Discord)
- [ ] Test a basic command like `/balance`
- [ ] Database file created at configured path
- [ ] No errors in console

## Deployment Platform Checklist

### Railway.app

- [ ] Account created and logged in
- [ ] GitHub repository connected
- [ ] Environment variables added in Railway dashboard
- [ ] Project deployed
- [ ] Bot is online (check Discord)

### PM2

- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] `ecosystem.config.js` is present
- [ ] Bot started with `npm run pm2:start` or `./start-pm2.bat`
- [ ] Process appears in `pm2 list`
- [ ] Logs are readable with `pm2 logs`
- [ ] Auto-restart configured: `pm2 startup` → `pm2 save`

### Docker

- [ ] Docker installed and running
- [ ] `Dockerfile` and `docker-compose.yml` present
- [ ] `.env` file is accessible to container
- [ ] `database/` directory exists or will be created
- [ ] Container builds: `docker build -t discord-economy-bot .`
- [ ] Container runs: `docker-compose up -d`
- [ ] Logs are visible: `docker logs -f discord-bot`

### Systemd (Linux)

- [ ] `discord-bot.service` file copied to `/etc/systemd/system/`
- [ ] Service is enabled: `sudo systemctl enable discord-bot`
- [ ] Service starts: `sudo systemctl start discord-bot`
- [ ] Service status OK: `sudo systemctl status discord-bot`

## Post-Deployment Verification

- [ ] Bot appears "Online" in Discord
- [ ] Slash commands work (test `/balance` or `/ping`)
- [ ] Database persists data between restarts
- [ ] Logs are being written
- [ ] No error messages in console/logs
- [ ] Bot can receive messages and respond to interactions

## Security & Backups

- [ ] `.env` is **never** committed to Git
- [ ] `.env` is added to `.gitignore`
- [ ] Database file is backed up regularly
- [ ] Logs are rotated or cleaned periodically
- [ ] Bot token is never shared or exposed in logs
- [ ] Only admins have access to admin commands

## Performance Monitoring

- [ ] Memory usage is reasonable (`pm2 monit` or `docker stats`)
- [ ] CPU usage is low at idle
- [ ] No memory leaks over time
- [ ] Database queries are fast
- [ ] Bot responds to interactions within 3 seconds

## Troubleshooting

If the bot doesn't start:

```bash
# Check syntax errors
node src/index.js

# Check environment variables
echo $DISCORD_TOKEN

# Check database connectivity
node -e "const Database = require('better-sqlite3'); const db = new Database('./database/data.sqlite'); console.log('DB OK');"

# Check Discord connectivity
# Ensure token is valid and bot is invited to server
```

---

Once all items are checked, your bot is ready for production!
