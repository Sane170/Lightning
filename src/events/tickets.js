const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../lib/database");

module.exports = client => {
 client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton() || !interaction.customId.startsWith("lightning:ticket:")) return;
  if (!interaction.guild) return interaction.reply({ content: "Tickets can only be used inside a server.", ephemeral: true });

  if (interaction.customId === "lightning:ticket:create") {
   const existing = db.prepare("SELECT channel_id FROM tickets WHERE guild_id = ? AND owner_id = ? AND status = 'open'")
    .get(interaction.guildId, interaction.user.id);
   if (existing) {
    const channel = interaction.guild.channels.cache.get(existing.channel_id);
    if (channel) return interaction.reply({ content: "You already have an open ticket: " + channel.toString(), ephemeral: true });
    db.prepare("UPDATE tickets SET status = 'closed' WHERE channel_id = ?").run(existing.channel_id);
   }

   const settings = db.prepare("SELECT support_role_id FROM ticket_settings WHERE guild_id = ?").get(interaction.guildId);
   const supportRole = settings?.support_role_id ? interaction.guild.roles.cache.get(settings.support_role_id) : null;
   const permissionOverwrites = [
    { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }
   ];
   if (supportRole) permissionOverwrites.push({
    id: supportRole.id,
    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
   });

   await interaction.deferReply({ ephemeral: true });
   const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 18) || "member";
   const channel = await interaction.guild.channels.create({
    name: "ticket-" + safeName,
    type: ChannelType.GuildText,
    topic: "Support ticket opened by " + interaction.user.tag + " (" + interaction.user.id + ")",
    permissionOverwrites
   });
   db.prepare("INSERT INTO tickets (channel_id, guild_id, owner_id, support_role_id) VALUES (?, ?, ?, ?)")
    .run(channel.id, interaction.guildId, interaction.user.id, supportRole?.id || null);

   const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("Support Ticket")
    .setDescription("Welcome! Please explain what you need help with. A staff member will assist you as soon as possible.")
    .addFields({ name: "Opened by", value: interaction.user.toString() });
   const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("lightning:ticket:close").setLabel("Close Ticket").setStyle(ButtonStyle.Danger)
   );
   await channel.send({ content: supportRole ? supportRole.toString() : null, embeds: [embed], components: [row] });
   return interaction.editReply({ content: "Your ticket is ready: " + channel.toString() });
  }

  if (interaction.customId === "lightning:ticket:close") {
   const ticket = db.prepare("SELECT * FROM tickets WHERE channel_id = ? AND guild_id = ? AND status = 'open'")
    .get(interaction.channelId, interaction.guildId);
   if (!ticket) return interaction.reply({ content: "This channel is not an open Lightning ticket.", ephemeral: true });
   const isOwner = ticket.owner_id === interaction.user.id;
   const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels);
   if (!isOwner && !isStaff) return interaction.reply({ content: "Only the ticket creator or server staff can close this ticket.", ephemeral: true });

   await interaction.deferUpdate();
   db.prepare("UPDATE tickets SET status = 'closed' WHERE channel_id = ?").run(interaction.channelId);
   await interaction.channel.permissionOverwrites.edit(ticket.owner_id, { ViewChannel: false }).catch(() => {});
   await interaction.channel.setName(("closed-" + interaction.channel.name).slice(0, 100)).catch(() => {});
   const closedEmbed = new EmbedBuilder().setColor(0x64748B).setTitle("Ticket Closed")
    .setDescription("This ticket has been closed. Staff can still review the conversation.");
   await interaction.message.edit({ embeds: [closedEmbed], components: [] });
   await interaction.channel.send("This ticket has been closed.");
  }
 });
};
