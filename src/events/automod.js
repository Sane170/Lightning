const { Events, PermissionFlagsBits } = require("discord.js");
const db = require("../lib/database");
const recentMessages = new Map();
const SPAM_LIMIT = 6;
const SPAM_WINDOW_MS = 7000;
const TIMEOUT_MS = 60000;

module.exports = client => {
 client.on(Events.MessageCreate, async message => {
  if (!message.guild || message.author.bot || !message.member) return;
  const settings = db.prepare("SELECT * FROM automod_settings WHERE guild_id = ?").get(message.guild.id);
  if (!settings) return;
  const botMember = message.guild.members.me;
  if (!botMember || !botMember.permissions.has(PermissionFlagsBits.ManageMessages)) return;

  let violation = null;
  if (settings.invites_enabled && /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/[\w-]+/i.test(message.content)) {
   violation = "Discord invite links are not allowed here.";
  }
  if (!violation && settings.mentions_enabled && message.mentions.users.size >= 5) {
   violation = "Mention spam is not allowed.";
  }
  if (!violation && settings.spam_enabled) {
   const key = message.guild.id + ":" + message.author.id;
   const now = Date.now();
   const recent = (recentMessages.get(key) || []).filter(time => now - time < SPAM_WINDOW_MS);
   recent.push(now);
   recentMessages.set(key, recent);
   if (recent.length >= SPAM_LIMIT) violation = "Please slow down—message spam is not allowed.";
  }
  if (!violation) return;

  const member = message.member;
  if (member.permissions.has(PermissionFlagsBits.Administrator) ||
      member.permissions.has(PermissionFlagsBits.ManageMessages) ||
      member.roles.highest.comparePositionTo(botMember.roles.highest) >= 0) return;

  await message.delete().catch(() => {});
  if (botMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
   await member.timeout(TIMEOUT_MS, "Lightning AutoMod: " + violation).catch(error => {
    console.error("AutoMod could not apply timeout:", error.message);
   });
  }
 });
};
