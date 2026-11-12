const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { canModerate } = require("../lib/permissions");
module.exports = {
 data: new SlashCommandBuilder().setName("kick").setDescription("Kick a member from this server.")
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption(o=>o.setName("member").setDescription("Member to kick").setRequired(true))
  .addStringOption(o=>o.setName("reason").setDescription("Reason for the kick").setMaxLength(500)),
 async execute(i) {
  const user=i.options.getUser("member",true), member=await i.guild.members.fetch(user.id).catch(()=>null);
  if (!member || !canModerate(i,member)) return i.reply({content:"I can't kick that member. Check role hierarchy and permissions.",ephemeral:true});
  await member.kick(i.options.getString("reason") || `Action by ${i.user.tag}`);
  await i.reply({content:`👢 Kicked **${user.tag}**.`,ephemeral:true});
 }
};
