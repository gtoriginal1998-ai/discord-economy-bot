# Discord Economy Bot — Deployment Guide

## Option 1: Railway.app (Easiest)

Railway.app is the easiest option for 24/7 hosting with zero configuration.

### Steps

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect your GitHub repo** or push this folder to a new GitHub repo
3. **Create a new project** and link your repository
4. **Add environment variables**:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID`
   - `DATABASE_PATH` (set to `./database/data.sqlite`)
5. **Deploy** — Railway auto-deploys on push
6. Bot runs 24/7 automatically

**Cost**: Free tier offers $5/month credit (plenty for a single bot)

---

## Option 2: PM2 (VPS / Windows Server)

Perfect for a Windows Server or Linux VPS you own or rent.

### Prerequisites

- Node.js 18+ installed
- PM2 installed globally: `npm install -g pm2`

### Setup on Windows

1. Navigate to bot folder
2. Run `start-pm2.bat`
3. View logs: `pm2 logs`
4. Monitor: `pm2 monit`

### Setup on Linux

```bash
npm install -g pm2
chmod +x start-pm2.sh
./start-pm2.sh
```

### Managing PM2

```bash
pm2 list                    # View all processes
pm2 logs discord-economy-bot   # View bot logs
pm2 monit                   # Monitor CPU/memory
pm2 restart discord-economy-bot    # Restart bot
pm2 stop discord-economy-bot       # Stop bot
pm2 delete discord-economy-bot     # Remove from PM2
```

### Auto-start on Reboot

```bash
pm2 startup
pm2 save
```

**Cost**: Depends on VPS ($5–$20/month typical)

---

## Option 3: Docker (Self-Hosted / VPS)

For maximum control and scalability.

### Prerequisites

- Docker installed
- Docker Compose (optional but recommended)

### Quick Start with Docker Compose

```bash
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f discord-bot
```

Stop:
```bash
docker-compose down
```

### Manual Docker Build

```bash
docker build -t discord-economy-bot .
docker run -d --name discord-bot \
  --env-file .env \
  -v $(pwd)/database:/app/database \
  -v $(pwd)/logs:/app/logs \
  discord-economy-bot
```

View logs:
```bash
docker logs -f discord-bot
```

### Docker Hub Deployment

Push to Docker Hub for easy deployment anywhere:

```bash
docker build -t your-username/discord-economy-bot .
docker login
docker push your-username/discord-economy-bot
```

Then deploy on any Docker-compatible host (AWS ECS, Digital Ocean, etc.)

**Cost**: Depends on hosting ($5–$50/month)

---

## Option 4: Systemd (Linux VPS / Dedicated Server)

For Linux servers that prefer systemd service management.

### Prerequisites

- Linux with systemd
- Node.js 18+ installed
- Bot cloned to `/home/discord-bot/discord-economy-bot`

### Setup

1. Create a dedicated user:
```bash
sudo useradd -m discord-bot
sudo su - discord-bot
```

2. Clone/setup bot in `/home/discord-bot/discord-economy-bot`

3. Install dependencies:
```bash
cd discord-economy-bot
npm install --only=production
mkdir -p logs
```

4. Copy the systemd service file:
```bash
sudo cp discord-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable discord-bot
sudo systemctl start discord-bot
```

5. Manage the service:
```bash
sudo systemctl status discord-bot       # Check status
sudo systemctl restart discord-bot      # Restart
sudo journalctl -u discord-bot -f       # View logs
```

**Cost**: Depends on VPS ($5–$20/month typical)

---

All platforms need these in your `.env` file:

```env
DISCORD_TOKEN=your-bot-token
CLIENT_ID=your-application-id
GUILD_ID=your-test-server-id
DATABASE_PATH=./database/data.sqlite
ADMIN_ROLE_ID=your-admin-role-id (optional)
```

---

## Monitoring & Logs

### Railway.app
- Logs visible in Railway dashboard
- Automatic alerts for crashes

### PM2
```bash
pm2 logs               # Real-time logs
pm2 save               # Persist process list
pm2 startup            # Auto-restart on server reboot
```

### Docker
```bash
docker logs -f container-name
docker stats           # CPU/memory usage
```

---

## Performance Tips

1. **Database**: `better-sqlite3` handles ~1000 concurrent users fine
2. **Memory**: Set `max_memory_restart` in PM2 to restart before memory leak
3. **Uptime**: All three options auto-restart on failure
4. **Backups**: Regular backup your `database/data.sqlite` file
5. **Updates**: To update the bot, pull new code and restart the process

---

## Recommended Setup

- **Testing**: Docker Compose locally
- **Production (Easiest)**: Railway.app
- **Production (Cheapest)**: PM2 on a $5 VPS
- **Production (Most Control)**: Docker on a VPS
