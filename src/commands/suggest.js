const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../lib/database");

module.exports = {
 data: new SlashCommandBuilder()
  .setName("suggest")
  .setDescription("Submit an idea for this server.")
  .addStringOption(option => option.setName("idea").setDescription("Your suggestion").setRequired(true).setMaxLength(1000)),
 async execute(interaction) {
  const settings = db.prepare("SELECT channel_id FROM suggestion_settings WHERE guild_id = ?").get(interaction.guildId);
  if (!settings) return interaction.reply({ content: "Suggestions have not been set up in this server yet.", ephemeral: true });
  const channel = await interaction.guild.channels.fetch(settings.channel_id).catch(() => null);
  if (!channel || !channel.isTextBased()) return interaction.reply({ content: "The suggestion channel is missing. Ask a server manager to configure it again.", ephemeral: true });
  const idea = interaction.options.getString("idea", true).trim();
  if (!idea) return interaction.reply({ content: "Please enter a suggestion before submitting.", ephemeral: true });
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("💡 New Suggestion")
   .setDescription(idea).addFields({ name: "Submitted by", value: interaction.user.tag })
   .setFooter({ text: "Status: Pending review" }).setTimestamp();
  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId("lightning:suggestion:approve").setLabel("Approve").setStyle(ButtonStyle.Success),
   new ButtonBuilder().setCustomId("lightning:suggestion:decline").setLabel("Decline").setStyle(ButtonStyle.Danger)
  );
  const message = await channel.send({ embeds: [embed], components: [row] });
  db.prepare("INSERT INTO suggestions (message_id, guild_id, user_id, suggestion) VALUES (?, ?, ?, ?)")
   .run(message.id, interaction.guildId, interaction.user.id, idea);
  await interaction.reply({ content: "Your suggestion has been submitted for review!", ephemeral: true });
 }
};
