const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const CommandHandler = require('./CommandHandler');
const EventHandler = require('./EventHandler');
const Database = require('../database/database');
const config = require('../config');

class BotClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
      ],
      partials: [Partials.Channel, Partials.Message, Partials.Reaction]
    });

    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.config = config;
    this.db = new Database(config.dbPath);

    new CommandHandler(this).load();
    new EventHandler(this).load();
  }
}

module.exports = BotClient;
