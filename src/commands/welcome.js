const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../lib/database");

module.exports = {
 data: new SlashCommandBuilder().setName("welcome").setDescription("Configure Lightning's welcome messages.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s => s.setName("set").setDescription("Choose a channel for welcome messages.")
   .addChannelOption(o => o.setName("channel").setDescription("Where welcome messages should appear.").setRequired(true))
   .addStringOption(o => o.setName("message").setDescription("Optional message. Use {user}, {server}, or {memberCount}.").setMaxLength(1000)))
  .addSubcommand(s => s.setName("disable").setDescription("Turn off welcome messages."))
  .addSubcommand(s => s.setName("status").setDescription("View the current welcome settings.")),
 async execute(i) {
  const action = i.options.getSubcommand();
  if (action === "set") {
   const channel = i.options.getChannel("channel");
   if (!channel.isTextBased() || channel.isDMBased()) return i.reply({ content: "Please choose a server text channel.", ephemeral: true });
   const message = i.options.getString("message") || "Welcome {user} to **{server}**! You are member **#{memberCount}**.";
   db.prepare("INSERT INTO welcome_settings (guild_id, channel_id, message) VALUES (?, ?, ?) ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id, message = excluded.message")
    .run(i.guildId, channel.id, message);
   return i.reply({ content: "Welcome messages will now be sent in " + channel.toString() + ".", ephemeral: true });
  }
  if (action === "disable") {
   db.prepare("DELETE FROM welcome_settings WHERE guild_id = ?").run(i.guildId);
   return i.reply({ content: "Welcome messages have been disabled.", ephemeral: true });
  }
  const settings = db.prepare("SELECT channel_id, message FROM welcome_settings WHERE guild_id = ?").get(i.guildId);
  if (!settings) return i.reply({ content: "Welcome messages are currently disabled.", ephemeral: true });
  const channel = i.guild.channels.cache.get(settings.channel_id);
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("Welcome Settings")
   .setDescription("Channel: " + (channel ? channel.toString() : "Channel not found") + "\nMessage: " + settings.message);
  return i.reply({ embeds: [embed], ephemeral: true });
 }
};
