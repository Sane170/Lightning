const { Events, EmbedBuilder } = require("discord.js");
const db = require("../lib/database");

module.exports = client => {
 async function sendLog(guild, embed) {
  const settings = db.prepare("SELECT channel_id FROM log_settings WHERE guild_id = ?").get(guild.id);
  if (!settings) return;
  const channel = guild.channels.cache.get(settings.channel_id);
  if (channel?.isTextBased()) await channel.send({ embeds: [embed] }).catch(() => {});
 }

 client.on(Events.GuildMemberAdd, async member => {
  const settings = db.prepare("SELECT channel_id, message FROM welcome_settings WHERE guild_id = ?").get(member.guild.id);
  if (settings) {
   const channel = member.guild.channels.cache.get(settings.channel_id);
   if (channel?.isTextBased()) {
    const content = settings.message
     .replaceAll("{user}", member.toString())
     .replaceAll("{server}", member.guild.name)
     .replaceAll("{memberCount}", String(member.guild.memberCount));
    await channel.send({ content }).catch(() => {});
   }
  }
  await sendLog(member.guild, new EmbedBuilder().setColor(0x22C55E).setTitle("Member Joined")
   .setDescription(member.user.tag + " joined the server.")
   .addFields({ name: "Account", value: "<t:" + Math.floor(member.user.createdTimestamp / 1000) + ":R>", inline: true })
   .setTimestamp());
 });

 client.on(Events.GuildMemberRemove, async member => {
  await sendLog(member.guild, new EmbedBuilder().setColor(0xF97316).setTitle("Member Left")
   .setDescription(member.user.tag + " left the server.")
   .setTimestamp());
 });

 client.on(Events.MessageDelete, async message => {
  if (!message.guild || message.author?.bot) return;
  await sendLog(message.guild, new EmbedBuilder().setColor(0xEF4444).setTitle("Message Deleted")
   .setDescription("A message was deleted.")
   .addFields(
    { name: "Author", value: message.author ? message.author.tag + " (" + message.author.id + ")" : "Unknown", inline: true },
    { name: "Channel", value: message.channel?.toString() || "Unknown", inline: true },
    { name: "Message ID", value: message.id }
   ).setFooter({ text: "Message text is not stored in logs." }).setTimestamp());
 });
};
