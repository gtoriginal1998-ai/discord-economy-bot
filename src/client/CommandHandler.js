const fs = require('fs');
const path = require('path');

class CommandHandler {
  constructor(client) {
    this.client = client;
  }

  load(folder = path.join(__dirname, '..', 'commands')) {
    const entries = fs.readdirSync(folder, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        this.load(fullPath);
        continue;
      }

      if (!entry.name.endsWith('.js')) continue;
      const command = require(fullPath);
      if (!command.data || !command.execute) continue;
      this.client.commands.set(command.data.name, command);
    }

    return this;
  }
}

module.exports = CommandHandler;
