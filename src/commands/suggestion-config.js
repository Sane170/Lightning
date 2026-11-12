const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../lib/database");

module.exports = {
 data: new SlashCommandBuilder().setName("suggestion-config").setDescription("Configure the server suggestion channel.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(sub => sub.setName("set").setDescription("Choose where suggestions are posted.")
   .addChannelOption(option => option.setName("channel").setDescription("Suggestion channel").setRequired(true)))
  .addSubcommand(sub => sub.setName("disable").setDescription("Turn off suggestions."))
  .addSubcommand(sub => sub.setName("status").setDescription("View the current suggestion setup.")),
 async execute(interaction) {
  const action = interaction.options.getSubcommand();
  if (action === "set") {
   const channel = interaction.options.getChannel("channel", true);
   if (!channel.isTextBased()) return interaction.reply({ content: "Choose a text channel.", ephemeral: true });
   db.prepare("INSERT INTO suggestion_settings (guild_id, channel_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id")
    .run(interaction.guildId, channel.id);
   return interaction.reply({ content: "Suggestions will now be posted in " + channel + ".", ephemeral: true });
  }
  if (action === "disable") {
   db.prepare("DELETE FROM suggestion_settings WHERE guild_id = ?").run(interaction.guildId);
   return interaction.reply({ content: "The suggestion system has been disabled.", ephemeral: true });
  }
  const settings = db.prepare("SELECT channel_id FROM suggestion_settings WHERE guild_id = ?").get(interaction.guildId);
  return interaction.reply({ content: settings ? "Suggestion channel: <#" + settings.channel_id + ">" : "Suggestions are not configured.", ephemeral: true });
 }
};
