# Push Discord Bot to GitHub

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Name it `discord-economy-bot`
3. Set to **Private** (only you can see it)
4. **Do NOT** initialize with README (we have one)
5. Click **Create repository**

---

## Step 2: Initialize Git Locally

Open PowerShell in your bot folder:

```powershell
cd C:\Users\rTBla\discord-economy-bot
git init
git add .
git commit -m "Initial commit: Discord economy bot with production configs"
```

---

## Step 3: Add Remote & Push

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/discord-economy-bot.git
git push -u origin main
```

**First time?** GitHub will prompt for authentication:
- Use a [Personal Access Token](https://github.com/settings/tokens) (easiest)
- Or authenticate with GitHub CLI: `gh auth login`

---

## Step 4: Verify

Check your repo at:
```
https://github.com/YOUR_USERNAME/discord-economy-bot
```

---

## For Railway.app Deployment

Once on GitHub, Railway can auto-deploy:

1. Go to https://railway.app
2. Click **New Project** → **Deploy from GitHub**
3. Select your repo
4. Add env vars (DISCORD_TOKEN, CLIENT_ID, GUILD_ID)
5. Deploy starts automatically
6. **Every push to main auto-deploys**

---

## Using GitHub CLI (Faster)

If you have [GitHub CLI](https://cli.github.com/) installed:

```powershell
cd C:\Users\rTBla\discord-economy-bot
git init
git add .
git commit -m "Initial commit: Discord economy bot with production configs"
gh repo create discord-economy-bot --private --source=. --remote=origin --push
```

One command sets up everything and pushes.

---

## SSH Setup (Optional, Avoids Token Prompts)

```powershell
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to GitHub: https://github.com/settings/keys
# Copy output from:
Get-Content ~/.ssh/id_ed25519.pub

# Update remote to use SSH:
git remote set-url origin git@github.com:YOUR_USERNAME/discord-economy-bot.git
```

---

## Common Issues

**"fatal: not a git repository"**
```powershell
cd C:\Users\rTBla\discord-economy-bot
git status
```

**"authentication failed"**
- Use Personal Access Token instead of password
- Or set up SSH keys

**Want to change from HTTPS to SSH later?**
```powershell
git remote set-url origin git@github.com:YOUR_USERNAME/discord-economy-bot.git
```

---

## That's It!

Your bot is now on GitHub and ready for Railway deployment or any other platform.
