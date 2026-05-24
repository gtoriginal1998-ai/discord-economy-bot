const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  adminRoleId: process.env.ADMIN_ROLE_ID || null,
  dbPath: process.env.DATABASE_PATH || path.resolve(__dirname, '../database/data.sqlite'),
  cooldowns: {
    daily: 24 * 60 * 60 * 1000,
    lootpack: 2 * 60 * 60 * 1000,
    spin: 60 * 60 * 1000,
    ticket: 60 * 1000
  },
  economy: {
    dailyReward: 250,
    lootpackCost: 150,
    spinCost: 50,
    ticketCost: 100,
    startingBalance: 500,
    xpPerAction: 15
  }
};
