const { Events, PermissionFlagsBits } = require("discord.js");
const db = require("../lib/database");
const recentMessages = new Map();
const SPAM_LIMIT = 6;
const SPAM_WINDOW_MS = 7000;
const TIMEOUT_MS = 60000;
const RAID_NEW_MEMBER_AGE_MS = 10 * 60 * 1000;
const RAID_SPAM_LIMIT = 3;
const RAID_SPAM_WINDOW_MS = 10000;

module.exports = client => {
 client.on(Events.MessageCreate, async message => {
  if (!message.guild || message.author.bot || !message.member) return;
  const settings = db.prepare("SELECT * FROM automod_settings WHERE guild_id = ?").get(message.guild.id) || {};
  const security = db.prepare("SELECT * FROM security_settings WHERE guild_id = ?").get(message.guild.id);
  const botMember = message.guild.members.me;
  if (!botMember || !botMember.permissions.has(PermissionFlagsBits.ManageMessages)) return;

  let violation = null;
  const lowerContent = message.content.toLowerCase();
  if (settings.invites_enabled && (
      lowerContent.includes("discord.gg/") ||
      lowerContent.includes("discord.com/invite/") ||
      lowerContent.includes("discordapp.com/invite/")
  )) {
   violation = "Discord invite links are not allowed here.";
  }
  if (!violation && settings.mentions_enabled && message.mentions.users.size >= 5) {
   violation = "Mention spam is not allowed.";
  }

  const isNewMemberDuringRaid = Boolean(security?.raid_mode && message.member.joinedTimestamp &&
   Date.now() - message.member.joinedTimestamp < RAID_NEW_MEMBER_AGE_MS);
  if (!violation && (settings.spam_enabled || isNewMemberDuringRaid)) {
   const key = message.guild.id + ":" + message.author.id;
   const now = Date.now();
   const windowMs = isNewMemberDuringRaid ? RAID_SPAM_WINDOW_MS : SPAM_WINDOW_MS;
   const limit = isNewMemberDuringRaid ? RAID_SPAM_LIMIT : SPAM_LIMIT;
   const recent = (recentMessages.get(key) || []).filter(time => now - time < windowMs);
   recent.push(now);
   recentMessages.set(key, recent);
   if (recent.length >= limit) {
    violation = isNewMemberDuringRaid
     ? "Temporary raid protection: new-member message flooding is restricted."
     : "Please slow down—message spam is not allowed.";
   }
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
