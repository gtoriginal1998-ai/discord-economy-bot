#!/bin/bash
set -e

echo "Starting Discord Economy Bot on PM2..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm install --only=production
fi

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js --name discord-economy-bot

# Save PM2 process list
pm2 save

echo "Bot started successfully!"
echo "Use 'pm2 logs' to view logs"
echo "Use 'pm2 monit' to monitor the process"
