const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { canModerate } = require("../lib/permissions");
module.exports = {
 data: new SlashCommandBuilder().setName("ban").setDescription("Ban a member from this server.")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption(o=>o.setName("member").setDescription("Member to ban").setRequired(true))
  .addStringOption(o=>o.setName("reason").setDescription("Reason for the ban").setMaxLength(500)),
 async execute(i) {
  const user=i.options.getUser("member",true), member=await i.guild.members.fetch(user.id).catch(()=>null);
  if (!member || !canModerate(i,member)) return i.reply({content:"I can't ban that member. Check role hierarchy and permissions.",ephemeral:true});
  await member.ban({reason:i.options.getString("reason") || `Action by ${i.user.tag}`});
  await i.reply({content:`🔨 Banned **${user.tag}**.`,ephemeral:true});
 }
};
