const { Events, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../lib/database");
const joinWindows = new Map();
const SUSPICIOUS_ACCOUNT_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const HONEYPOT_TIMEOUT_MS = 10 * 60 * 1000;
function ensureSettings(guildId) {
 db.prepare("INSERT OR IGNORE INTO security_settings (guild_id) VALUES (?)").run(guildId);
 return db.prepare("SELECT * FROM security_settings WHERE guild_id = ?").get(guildId);
}
function record(guildId, type, userId, details) {
 db.prepare("INSERT INTO security_events (guild_id, event_type, user_id, details) VALUES (?, ?, ?, ?)").run(guildId, type, userId || null, details);
}
async function logToSecurityChannel(guild, settings, payload) {
 if (!settings.log_channel_id) return;
 const channel = await guild.channels.fetch(settings.log_channel_id).catch(() => null);
 if (channel?.isTextBased()) await channel.send(payload).catch(() => {});
}
module.exports = client => {
 client.on(Events.GuildMemberAdd, async member => {
  const settings = ensureSettings(member.guild.id);
  const now = Date.now();
  const windowMs = Math.max(5, settings.raid_window_seconds || 20) * 1000;
  const recent = (joinWindows.get(member.guild.id) || []).filter(timestamp => now - timestamp < windowMs);
  recent.push(now);
  joinWindows.set(member.guild.id, recent);
  if (now - member.user.createdTimestamp < SUSPICIOUS_ACCOUNT_AGE_MS) {
   record(member.guild.id, "new_account_join", member.id, "Account created less than 3 days ago.");
   await logToSecurityChannel(member.guild, settings, { embeds: [new EmbedBuilder().setColor(0xE0A12B).setTitle("New account joined")
    .setDescription(member.user.tag + " joined with an account less than 3 days old.")
    .addFields({ name: "Member", value: member.toString(), inline: true },
     { name: "Account created", value: "<t:" + Math.floor(member.user.createdTimestamp / 1000) + ":R>", inline: true }).setTimestamp()] });
  }
  if (recent.length >= settings.raid_threshold && !settings.raid_mode) {
   db.prepare("UPDATE security_settings SET raid_mode = 1 WHERE guild_id = ?").run(member.guild.id);
   record(member.guild.id, "join_spike", member.id, recent.length + " joins in " + settings.raid_window_seconds + " seconds; raid mode enabled.");
   await logToSecurityChannel(member.guild, settings, { embeds: [new EmbedBuilder().setColor(0xD83C3E).setTitle("Possible join raid detected")
    .setDescription(recent.length + " members joined within " + settings.raid_window_seconds + " seconds. Lightning enabled raid mode.")
    .addFields({ name: "What changed", value: "Recently joined members now have stricter spam limits. No members were automatically banned or kicked." }).setTimestamp()] });
  }
 });
 client.on(Events.MessageCreate, async message => {
  if (!message.guild || message.author.bot) return;
  const settings = ensureSettings(message.guild.id);
  if (!settings.honeypot_channel_id || message.channel.id !== settings.honeypot_channel_id) return;
  const member = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);
  if (!member || member.permissions.has(PermissionFlagsBits.Administrator) ||
      member.permissions.has(PermissionFlagsBits.ManageGuild) || member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
  await message.delete().catch(() => {});
  const botMember = message.guild.members.me;
  const accountIsNew = Date.now() - member.user.createdTimestamp < SUSPICIOUS_ACCOUNT_AGE_MS;
  let timedOut = false;
  if (accountIsNew && botMember?.permissions.has(PermissionFlagsBits.ModerateMembers) &&
      member.roles.highest.comparePositionTo(botMember.roles.highest) < 0) {
   timedOut = await member.timeout(HONEYPOT_TIMEOUT_MS, "Lightning honeypot triggered by a recently created account").then(() => true).catch(() => false);
  }
  record(message.guild.id, "honeypot_trigger", member.id, "Honeypot message; timeout " + (timedOut ? "applied" : "not applied") + ".");
  await logToSecurityChannel(message.guild, settings, { embeds: [new EmbedBuilder().setColor(0xD83C3E).setTitle("Honeypot triggered")
   .setDescription(member.user.tag + " sent a message in the honeypot channel.")
   .addFields({ name: "Member", value: member.toString(), inline: true },
    { name: "Action", value: timedOut ? "Message deleted; 10-minute timeout applied because the account is under 3 days old." : "Message deleted; moderator review required." }).setTimestamp()] });
 });
};
