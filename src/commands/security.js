const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require("discord.js");
const db = require("../lib/database");
function ensureSettings(guildId) {
 db.prepare("INSERT OR IGNORE INTO security_settings (guild_id) VALUES (?)").run(guildId);
 return db.prepare("SELECT * FROM security_settings WHERE guild_id = ?").get(guildId);
}
function record(guildId, type, userId, details) {
 db.prepare("INSERT INTO security_events (guild_id, event_type, user_id, details) VALUES (?, ?, ?, ?)").run(guildId, type, userId || null, details);
}
async function sendSecurityLog(guild, content) {
 const settings = ensureSettings(guild.id);
 if (!settings.log_channel_id) return;
 const channel = await guild.channels.fetch(settings.log_channel_id).catch(() => null);
 if (channel?.isTextBased()) await channel.send({ content }).catch(() => {});
}
module.exports = {
 data: new SlashCommandBuilder().setName("security").setDescription("Configure Lightning anti-raid and honeypot protection.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s => s.setName("status").setDescription("View this server security settings."))
  .addSubcommand(s => s.setName("set-log-channel").setDescription("Choose where security alerts are sent.")
   .addChannelOption(o => o.setName("channel").setDescription("Security log channel").addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand(s => s.setName("setup-honeypot").setDescription("Create a visible trap channel for suspicious accounts."))
  .addSubcommand(s => s.setName("raid-mode").setDescription("Enable or disable heightened new-member protection.")
   .addBooleanOption(o => o.setName("enabled").setDescription("Whether raid mode is enabled").setRequired(true)))
  .addSubcommand(s => s.setName("set-raid-threshold").setDescription("Set the join-spike alert threshold.")
   .addIntegerOption(o => o.setName("members").setDescription("Joins in the time window (3-30)").setMinValue(3).setMaxValue(30).setRequired(true))),
 async execute(i) {
  if (!i.inGuild() || !i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return i.reply({ content: "You need Manage Server to configure Lightning security.", ephemeral: true });
  const settings = ensureSettings(i.guildId);
  const sub = i.options.getSubcommand();
  if (sub === "status") {
   const recent = db.prepare("SELECT COUNT(*) AS count FROM security_events WHERE guild_id = ? AND created_at >= datetime('now', '-24 hours')").get(i.guildId).count;
   const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("Lightning Security").addFields(
    { name: "Honeypot", value: settings.honeypot_channel_id ? "<#" + settings.honeypot_channel_id + ">" : "Not configured", inline: true },
    { name: "Security logs", value: settings.log_channel_id ? "<#" + settings.log_channel_id + ">" : "Not configured", inline: true },
    { name: "Raid mode", value: settings.raid_mode ? "Enabled" : "Disabled", inline: true },
    { name: "Join alert threshold", value: settings.raid_threshold + " joins / " + settings.raid_window_seconds + " seconds", inline: true },
    { name: "Security events (24h)", value: String(recent), inline: true }
   ).setFooter({ text: "Raid mode applies stricter spam limits to recently joined members." });
   return i.reply({ embeds: [embed], ephemeral: true });
  }
  if (sub === "set-log-channel") {
   const channel = i.options.getChannel("channel", true);
   db.prepare("UPDATE security_settings SET log_channel_id = ? WHERE guild_id = ?").run(channel.id, i.guildId);
   return i.reply({ content: "Security alerts will be sent to " + channel + ".", ephemeral: true });
  }
  if (sub === "setup-honeypot") {
   if (!i.guild.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)) return i.reply({ content: "I need Manage Channels to create the honeypot channel.", ephemeral: true });
   const existing = settings.honeypot_channel_id ? await i.guild.channels.fetch(settings.honeypot_channel_id).catch(() => null) : null;
   if (existing) return i.reply({ content: "Your honeypot is already set up: " + existing + ".", ephemeral: true });
   const channel = await i.guild.channels.create({
    name: "human-check", type: ChannelType.GuildText,
    topic: "Lightning security trap. Do not send messages here. Messages may be removed and trigger moderator review.",
    reason: "Set up Lightning honeypot protection"
   });
   await channel.send({ embeds: [new EmbedBuilder().setColor(0xE0A12B).setTitle("Security verification area")
    .setDescription("This channel is monitored by Lightning. Do not send messages here. Unexpected messages are treated as suspicious and sent to moderators.")
    .setFooter({ text: "Server staff are exempt from honeypot enforcement." })] }).catch(() => {});
   db.prepare("UPDATE security_settings SET honeypot_channel_id = ? WHERE guild_id = ?").run(channel.id, i.guildId);
   record(i.guildId, "honeypot_setup", i.user.id, "Created #" + channel.name);
   return i.reply({ content: "Created " + channel + ". It is visible and writable so suspicious accounts can trigger it. Tell members not to post there; staff are exempt. Set a log channel with /security set-log-channel.", ephemeral: true });
  }
  if (sub === "raid-mode") {
   const enabled = i.options.getBoolean("enabled", true) ? 1 : 0;
   db.prepare("UPDATE security_settings SET raid_mode = ? WHERE guild_id = ?").run(enabled, i.guildId);
   record(i.guildId, enabled ? "raid_mode_enabled" : "raid_mode_disabled", i.user.id, "Manually changed by " + i.user.tag);
   await sendSecurityLog(i.guild, (enabled ? "Raid mode enabled" : "Raid mode disabled") + " by " + i.user.tag + ".");
   return i.reply({ content: enabled ? "Raid mode enabled. New members who joined within the last 10 minutes now have stricter spam limits." : "Raid mode disabled. Normal AutoMod thresholds are active.", ephemeral: true });
  }
  if (sub === "set-raid-threshold") {
   const threshold = i.options.getInteger("members", true);
   db.prepare("UPDATE security_settings SET raid_threshold = ? WHERE guild_id = ?").run(threshold, i.guildId);
   return i.reply({ content: "Join-spike alerts will trigger at " + threshold + " joins within 20 seconds.", ephemeral: true });
  }
 }
};
