const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../lib/database");
module.exports = {
 data: new SlashCommandBuilder().setName("level-config").setDescription("Manage the server XP leveling system.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s => s.setName("enable").setDescription("Enable XP and levels."))
  .addSubcommand(s => s.setName("disable").setDescription("Disable XP and levels."))
  .addSubcommand(s => s.setName("status").setDescription("Check whether leveling is enabled.")),
 async execute(interaction) {
  const action = interaction.options.getSubcommand();
  if (action === "status") {
   const row = db.prepare("SELECT enabled FROM level_settings WHERE guild_id = ?").get(interaction.guildId);
   return interaction.reply({ content: "Leveling is **" + (row?.enabled === 0 ? "disabled" : "enabled") + "**.", ephemeral: true });
  }
  const enabled = action === "enable" ? 1 : 0;
  db.prepare("INSERT INTO level_settings (guild_id, enabled) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET enabled = excluded.enabled")
   .run(interaction.guildId, enabled);
  await interaction.reply({ content: "The leveling system is now **" + (enabled ? "enabled" : "disabled") + "**.", ephemeral: true });
 }
};
