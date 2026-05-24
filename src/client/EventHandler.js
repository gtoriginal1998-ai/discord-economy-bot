const fs = require('fs');
const path = require('path');

class EventHandler {
  constructor(client) {
    this.client = client;
  }

  load(folder = path.join(__dirname, '..', 'events')) {
    const entries = fs.readdirSync(folder, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        this.load(fullPath);
        continue;
      }

      if (!entry.name.endsWith('.js')) continue;
      const event = require(fullPath);
      if (!event.name || !event.execute) continue;

      if (event.once) {
        this.client.once(event.name, (...args) => event.execute(this.client, ...args));
      } else {
        this.client.on(event.name, (...args) => event.execute(this.client, ...args));
      }
    }

    return this;
  }
}

module.exports = EventHandler;
