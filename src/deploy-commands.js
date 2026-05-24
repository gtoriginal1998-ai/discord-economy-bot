const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const config = require('./config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

function loadCommands(folder) {
  const entries = fs.readdirSync(folder, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      loadCommands(fullPath);
      continue;
    }

    if (!entry.name.endsWith('.js')) continue;
    const command = require(fullPath);
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }
}

loadCommands(commandsPath);

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log(`Registering ${commands.length} commands for guild ${config.guildId}...`);
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body: commands
    });
    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error('Failed to register commands:', error);
    process.exit(1);
  }
})();
