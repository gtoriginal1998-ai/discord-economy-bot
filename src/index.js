const config = require('./config');
const BotClient = require('./client/Client');

if (!config.token || !config.clientId || !config.guildId) {
  console.error('Missing required environment variables in .env. Please set DISCORD_TOKEN, CLIENT_ID, and GUILD_ID.');
  process.exit(1);
}

const client = new BotClient();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(config.token).catch((error) => {
  console.error('Failed to login:', error);
  process.exit(1);
});
