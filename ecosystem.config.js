module.exports = {
  apps: [
    {
      name: 'discord-economy-bot',
      script: './src/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'database', 'logs'],
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
