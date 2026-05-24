@echo off
REM Windows PM2 Start Script
REM Make sure PM2 is installed globally: npm install -g pm2

echo Starting Discord Economy Bot on PM2...

if not exist node_modules (
  echo Installing dependencies...
  call npm install --only=production
)

if not exist logs (
  mkdir logs
)

echo Starting PM2 process...
call pm2 start ecosystem.config.js --name discord-economy-bot
call pm2 save

echo.
echo Bot started successfully!
echo Use 'pm2 logs' to view logs
echo Use 'pm2 monit' to monitor the process
pause
