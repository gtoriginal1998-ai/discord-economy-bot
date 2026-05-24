# Discord Economy & Minigame Bot

A private Discord economy/minigame bot built in Node.js with `discord.js`.

## Features
- Ticket economy system
- Daily rewards with cooldowns
- Loot pack purchases and random drops
- Spinner wheel game
- Raffle system with join buttons
- User inventory and points/xp tracking
- Slash commands, embeds, buttons, dropdowns
- Admin controls and cooldown protection
- Persistent SQLite database

## Setup
1. Install Node.js 18+.
2. Open the project folder in VS Code.
3. Copy `.env.example` to `.env` and fill in values.
4. Run `npm install`.
5. Run `npm run deploy` to register slash commands.
6. Start the bot with `npm start`.

## Deployment (24/7 Hosting)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guides:

- **Railway.app** — Easiest, $5/month credit (recommended)
- **PM2** — Cheapest, self-hosted on a VPS
- **Docker** — Most control, Dockerfile + docker-compose included

Quick start:
```bash
# Railway.app: Connect GitHub repo, set env vars, auto-deploys
# PM2: npm run pm2:start (or ./start-pm2.bat on Windows)
# Docker: docker-compose up -d
```

## Project Structure
- `src/index.js` — entry point
- `src/client/` — bot client, command loader, event loader
- `src/commands/` — slash command implementations
- `src/database/` — SQLite persistence and query helpers
- `src/events/` — event handlers
- `src/utils/` — shared helpers

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Complete 24/7 hosting guides (Railway, PM2, Docker, Systemd)
- **[PRODUCTION.md](./PRODUCTION.md)** — Production config summary and best practices
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** — One-liner deployment commands
- **[CHECKLIST.md](./CHECKLIST.md)** — Pre/post-deployment verification

## Notes
This project is built to be extendable. Add more commands in `src/commands` and keep the business logic inside `src/database` and `src/utils`.
