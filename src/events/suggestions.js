const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../lib/database");

module.exports = client => {
 client.on("interactionCreate", async interaction => {
  if (!interaction.isButton() || !interaction.customId.startsWith("lightning:suggestion:")) return;
  if (!interaction.memberPermissions?.has("ManageGuild")) {
   return interaction.reply({ content: "Only server managers can review suggestions.", ephemeral: true });
  }
  const suggestion = db.prepare("SELECT * FROM suggestions WHERE message_id = ? AND guild_id = ?")
   .get(interaction.message.id, interaction.guildId);
  if (!suggestion) return interaction.reply({ content: "This suggestion could not be found in the database.", ephemeral: true });
  if (suggestion.status !== "pending") return interaction.reply({ content: "This suggestion has already been reviewed.", ephemeral: true });
  const approved = interaction.customId.endsWith(":approve");
  const status = approved ? "approved" : "declined";
  db.prepare("UPDATE suggestions SET status = ? WHERE message_id = ?").run(status, interaction.message.id);
  const embed = interaction.message.embeds[0];
  const { EmbedBuilder } = require("discord.js");
  const updated = EmbedBuilder.from(embed).setColor(approved ? 0x2ECC71 : 0xE74C3C)
   .setFooter({ text: "Status: " + (approved ? "Approved" : "Declined") });
  await interaction.update({ embeds: [updated], components: [] });
  const member = await interaction.guild.members.fetch(suggestion.user_id).catch(() => null);
  if (member) await member.send("Your suggestion in **" + interaction.guild.name + "** was " + status + ".").catch(() => {});
 });
};
