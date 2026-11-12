const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
 data: new SlashCommandBuilder().setName("announce").setDescription("Post a formatted server announcement.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addChannelOption(o => o.setName("channel").setDescription("Where to post the announcement.").setRequired(true))
  .addStringOption(o => o.setName("title").setDescription("Announcement title").setMaxLength(200).setRequired(true))
  .addStringOption(o => o.setName("message").setDescription("Announcement details").setMaxLength(3500).setRequired(true)),
 async execute(i) {
  const channel = i.options.getChannel("channel");
  if (!channel.isTextBased() || channel.isDMBased()) return i.reply({ content: "Please select a server text channel.", ephemeral: true });
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle(i.options.getString("title"))
   .setDescription(i.options.getString("message")).setFooter({ text: "Posted by "+i.user.username+" • Lightning" }).setTimestamp();
  await channel.send({ embeds:[embed], allowedMentions:{ parse:[] } });
  await i.reply({ content: "Your announcement has been posted in "+channel.toString()+".", ephemeral: true });
 }
};
