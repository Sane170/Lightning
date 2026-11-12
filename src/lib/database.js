const Database = require("better-sqlite3");
const path = require("node:path");
const fs = require("node:fs");
const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "lightning.sqlite"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS warnings (
 id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id TEXT NOT NULL, user_id TEXT NOT NULL,
 moderator_id TEXT NOT NULL, reason TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS ticket_settings (
 guild_id TEXT PRIMARY KEY, support_role_id TEXT
);
CREATE TABLE IF NOT EXISTS tickets (
 channel_id TEXT PRIMARY KEY, guild_id TEXT NOT NULL, owner_id TEXT NOT NULL,
 support_role_id TEXT, status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS automod_settings (
 guild_id TEXT PRIMARY KEY, spam_enabled INTEGER NOT NULL DEFAULT 0,
 invites_enabled INTEGER NOT NULL DEFAULT 0, mentions_enabled INTEGER NOT NULL DEFAULT 0
);
`);
module.exports = db;
