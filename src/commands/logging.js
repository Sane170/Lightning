const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../lib/database");

module.exports = {
 data: new SlashCommandBuilder().setName("logging").setDescription("Configure Lightning's server event logs.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s => s.setName("set").setDescription("Choose a channel for event logs.")
   .addChannelOption(o => o.setName("channel").setDescription("Where logs should appear.").setRequired(true)))
  .addSubcommand(s => s.setName("disable").setDescription("Turn off event logs."))
  .addSubcommand(s => s.setName("status").setDescription("View the current logging settings.")),
 async execute(i) {
  const action = i.options.getSubcommand();
  if (action === "set") {
   const channel = i.options.getChannel("channel");
   if (!channel.isTextBased() || channel.isDMBased()) return i.reply({ content: "Please choose a server text channel.", ephemeral: true });
   db.prepare("INSERT INTO log_settings (guild_id, channel_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id")
    .run(i.guildId, channel.id);
   return i.reply({ content: "Event logs will now be sent in " + channel.toString() + ".", ephemeral: true });
  }
  if (action === "disable") {
   db.prepare("DELETE FROM log_settings WHERE guild_id = ?").run(i.guildId);
   return i.reply({ content: "Event logs have been disabled.", ephemeral: true });
  }
  const settings = db.prepare("SELECT channel_id FROM log_settings WHERE guild_id = ?").get(i.guildId);
  const channel = settings && i.guild.channels.cache.get(settings.channel_id);
  return i.reply({ embeds: [new EmbedBuilder().setColor(0x258BFF).setTitle("Logging Settings")
   .setDescription(channel ? "Event logs are active in " + channel.toString() + "." : "Event logging is currently disabled or its channel is missing.")], ephemeral: true });
 }
};
