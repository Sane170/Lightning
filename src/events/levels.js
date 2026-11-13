const { Events, EmbedBuilder } = require("discord.js");
const db = require("../lib/database");

module.exports = client => {
 client.on(Events.MessageCreate, async message => {
  if (!message.guild || message.author.bot || !message.member) return;
  const settings = db.prepare("SELECT enabled FROM level_settings WHERE guild_id = ?").get(message.guild.id);
  if (settings?.enabled === 0) return;
  const now = Date.now();
  const existing = db.prepare("SELECT xp, last_xp_at FROM levels WHERE guild_id = ? AND user_id = ?").get(message.guild.id, message.author.id);
  if (existing && now - existing.last_xp_at < 60000) return;
  const gained = Math.floor(Math.random() * 11) + 15;
  const oldXp = existing?.xp || 0;
  const newXp = oldXp + gained;
  const oldLevel = Math.floor(Math.sqrt(oldXp / 100));
  const newLevel = Math.floor(Math.sqrt(newXp / 100));
  db.prepare("INSERT INTO levels (guild_id, user_id, xp, last_xp_at) VALUES (?, ?, ?, ?) ON CONFLICT(guild_id, user_id) DO UPDATE SET xp = excluded.xp, last_xp_at = excluded.last_xp_at")
   .run(message.guild.id, message.author.id, newXp, now);
  if (newLevel > oldLevel) {
   const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("⚡ Level Up!")
    .setDescription(message.author.toString() + " reached **Level " + newLevel + "**!")
    .setFooter({ text: "Keep chatting to earn more XP." });
   await message.channel.send({ embeds: [embed], allowedMentions: { users: [message.author.id] } }).catch(() => {});
  }
 });
};
