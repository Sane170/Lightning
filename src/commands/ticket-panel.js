const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../lib/database");
module.exports = {
 data: new SlashCommandBuilder().setName("ticket-panel").setDescription("Post a support ticket panel in this channel.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addRoleOption(o => o.setName("support-role").setDescription("Optional role that can view and answer tickets.")),
 async execute(i) {
  const supportRole = i.options.getRole("support-role");
  db.prepare("INSERT INTO ticket_settings (guild_id, support_role_id) VALUES (?, ?) ON CONFLICT(guild_id) DO UPDATE SET support_role_id = excluded.support_role_id")
   .run(i.guildId, supportRole?.id || null);
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("⚡ Contact Support")
   .setDescription("Need help? Press the button below to create a private support ticket. Please describe your issue once the channel opens.")
   .setFooter({ text: "Lightning Support System" });
  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId("lightning:ticket:create").setLabel("Create Ticket").setStyle(ButtonStyle.Primary).setEmoji("🎫")
  );
  await i.reply({ content: "Ticket panel posted.", ephemeral: true });
  await i.channel.send({ embeds: [embed], components: [row] });
 }
};
