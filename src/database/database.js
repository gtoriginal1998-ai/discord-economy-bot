const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    this.db = new Database(filePath);
    this.db.pragma('journal_mode = WAL');
    this.setupSchema();
  }

  setupSchema() {
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        guildId TEXT NOT NULL,
        userId TEXT NOT NULL,
        balance INTEGER NOT NULL DEFAULT 0,
        tickets INTEGER NOT NULL DEFAULT 0,
        lastDaily INTEGER DEFAULT 0,
        lastLootpack INTEGER DEFAULT 0,
        lastSpin INTEGER DEFAULT 0,
        lastTicket INTEGER DEFAULT 0,
        PRIMARY KEY (guildId, userId)
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guildId TEXT NOT NULL,
        userId TEXT NOT NULL,
        item TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );

      CREATE TABLE IF NOT EXISTS raffles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guildId TEXT NOT NULL,
        prize TEXT NOT NULL,
        entryCost INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );

      CREATE TABLE IF NOT EXISTS raffle_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        raffleId INTEGER NOT NULL,
        userId TEXT NOT NULL,
        tickets INTEGER NOT NULL DEFAULT 1,
        UNIQUE(raffleId, userId),
        FOREIGN KEY (raffleId) REFERENCES raffles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS kaos_links (
        guildId TEXT NOT NULL,
        userId TEXT NOT NULL,
        steamId TEXT NOT NULL,
        linkedAt INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        PRIMARY KEY (guildId, userId)
      );

      CREATE TABLE IF NOT EXISTS pending_deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guildId TEXT NOT NULL,
        userId TEXT NOT NULL,
        item TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        deliveredAt INTEGER DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS raffle_meta (
        guildId TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (guildId, key)
      );
    `;

    this.db.exec(schema);
  }

  ensureUser(guildId, userId) {
    const stmt = this.db.prepare(
      'INSERT OR IGNORE INTO users (guildId, userId, balance, tickets) VALUES (?, ?, 0, 0)'
    );
    stmt.run(guildId, userId);
  }

  getUser(guildId, userId) {
    this.ensureUser(guildId, userId);
    return this.db.prepare('SELECT * FROM users WHERE guildId = ? AND userId = ?').get(guildId, userId);
  }

  updateUser(guildId, userId, data) {
    const fields = Object.keys(data);
    if (!fields.length) return;

    const setClause = fields.map((field) => `${field} = @${field}`).join(', ');
    const stmt = this.db.prepare(`UPDATE users SET ${setClause} WHERE guildId = @guildId AND userId = @userId`);
    stmt.run({ guildId, userId, ...data });
  }

  modifyBalance(guildId, userId, amount) {
    this.ensureUser(guildId, userId);
    const stmt = this.db.prepare('UPDATE users SET balance = balance + ? WHERE guildId = ? AND userId = ?');
    stmt.run(amount, guildId, userId);
    return this.getUser(guildId, userId);
  }

  addItem(guildId, userId, item, quantity = 1) {
    this.ensureUser(guildId, userId);
    const existing = this.db.prepare('SELECT * FROM inventory WHERE guildId = ? AND userId = ? AND item = ?').get(guildId, userId, item);
    if (existing) {
      this.db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
    } else {
      this.db.prepare('INSERT INTO inventory (guildId, userId, item, quantity) VALUES (?, ?, ?, ?)').run(guildId, userId, item, quantity);
    }
  }

  getInventory(guildId, userId) {
    return this.db.prepare('SELECT item, quantity FROM inventory WHERE guildId = ? AND userId = ?').all(guildId, userId);
  }

  addTickets(guildId, userId, amount) {
    this.ensureUser(guildId, userId);
    this.db.prepare('UPDATE users SET tickets = tickets + ? WHERE guildId = ? AND userId = ?').run(amount, guildId, userId);
  }

  setCooldown(guildId, userId, key, timestamp) {
    this.ensureUser(guildId, userId);
    this.db.prepare(`UPDATE users SET ${key} = ? WHERE guildId = ? AND userId = ?`).run(timestamp, guildId, userId);
  }

  createRaffle(guildId, prize, entryCost) {
    const stmt = this.db.prepare('INSERT INTO raffles (guildId, prize, entryCost, status) VALUES (?, ?, ?, ?)');
    const result = stmt.run(guildId, prize, entryCost, 'open');
    return this.db.prepare('SELECT * FROM raffles WHERE id = ?').get(result.lastInsertRowid);
  }

  getOpenRaffle(guildId) {
    return this.db.prepare('SELECT * FROM raffles WHERE guildId = ? AND status = ?').get(guildId, 'open');
  }

  // KAOS Linking
  linkAccount(guildId, userId, steamId) {
    this.db.prepare('INSERT OR REPLACE INTO kaos_links (guildId, userId, steamId) VALUES (?, ?, ?)').run(guildId, userId, steamId);
  }

  getLinkedAccount(guildId, userId) {
    return this.db.prepare('SELECT steamId FROM kaos_links WHERE guildId = ? AND userId = ?').get(guildId, userId);
  }

  unlinkAccount(guildId, userId) {
    this.db.prepare('DELETE FROM kaos_links WHERE guildId = ? AND userId = ?').run(guildId, userId);
  }

  // Pending Deliveries
  addDelivery(guildId, userId, item, quantity) {
    this.db.prepare('INSERT INTO pending_deliveries (guildId, userId, item, quantity) VALUES (?, ?, ?, ?)').run(guildId, userId, item, quantity);
  }

  getPendingDeliveries(guildId, userId) {
    return this.db.prepare('SELECT id, item, quantity FROM pending_deliveries WHERE guildId = ? AND userId = ? AND status = ?').all(guildId, userId, 'pending');
  }

  markDeliveryComplete(deliveryId) {
    this.db.prepare('UPDATE pending_deliveries SET status = ?, deliveredAt = ? WHERE id = ?').run('delivered', Date.now(), deliveryId);
  }

  getDeliveryHistory(guildId, userId, limit = 10) {
    return this.db.prepare('SELECT item, quantity, status, createdAt FROM pending_deliveries WHERE guildId = ? AND userId = ? ORDER BY createdAt DESC LIMIT ?').all(guildId, userId, limit);
  }

  addRaffleEntry(raffleId, userId, tickets = 1) {
    const existing = this.db.prepare('SELECT * FROM raffle_entries WHERE raffleId = ? AND userId = ?').get(raffleId, userId);
    if (existing) {
      this.db.prepare('UPDATE raffle_entries SET tickets = tickets + ? WHERE id = ?').run(tickets, existing.id);
    } else {
      this.db.prepare('INSERT INTO raffle_entries (raffleId, userId, tickets) VALUES (?, ?, ?)').run(raffleId, userId, tickets);
    }
  }

  getRaffleEntries(raffleId) {
    return this.db.prepare('SELECT * FROM raffle_entries WHERE raffleId = ?').all(raffleId);
  }

  closeRaffle(raffleId) {
    this.db.prepare('UPDATE raffles SET status = ? WHERE id = ?').run('closed', raffleId);
  }

  /**
   * Draw a winner from a raffle's entries using weighted ticket selection.
   * Returns the winning userId, or null if there were no entries.
   * Does NOT close the raffle — call closeRaffle() separately.
   */
  drawRaffleWinner(raffleId) {
    const entries = this.getRaffleEntries(raffleId);
    if (!entries.length) return null;

    const pool = [];
    for (const entry of entries) {
      for (let i = 0; i < entry.tickets; i++) {
        pool.push(entry.userId);
      }
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── Daily raffle meta ──────────────────────────────────────────────────────

  /**
   * Returns the day-of-week number (0–6) of the currently open daily raffle,
   * or null if no daily raffle is tracked as open.
   */
  getCurrentRaffleDay(guildId) {
    const row = this.db
      .prepare('SELECT value FROM raffle_meta WHERE guildId = ? AND key = ?')
      .get(guildId, 'currentRaffleDay');
    return row ? parseInt(row.value, 10) : null;
  }

  /**
   * Store which day-of-week (0–6) the currently open daily raffle was created
   * for. Pass null to clear the value (e.g. after the raffle is drawn).
   */
  setRaffleDay(guildId, day) {
    if (day === null) {
      this.db
        .prepare('DELETE FROM raffle_meta WHERE guildId = ? AND key = ?')
        .run(guildId, 'currentRaffleDay');
    } else {
      this.db
        .prepare('INSERT OR REPLACE INTO raffle_meta (guildId, key, value) VALUES (?, ?, ?)')
        .run(guildId, 'currentRaffleDay', String(day));
    }
  }

  /**
   * Persist the message ID of the active daily raffle embed so the scheduler
   * can edit / reference it after a restart.
   */
  getRaffleMessageId(guildId) {
    const row = this.db
      .prepare('SELECT value FROM raffle_meta WHERE guildId = ? AND key = ?')
      .get(guildId, 'raffleMessageId');
    return row ? row.value : null;
  }

  setRaffleMessageId(guildId, messageId) {
    if (messageId === null) {
      this.db
        .prepare('DELETE FROM raffle_meta WHERE guildId = ? AND key = ?')
        .run(guildId, 'raffleMessageId');
    } else {
      this.db
        .prepare('INSERT OR REPLACE INTO raffle_meta (guildId, key, value) VALUES (?, ?, ?)')
        .run(guildId, 'raffleMessageId', String(messageId));
    }
  }
}

module.exports = DatabaseManager;
