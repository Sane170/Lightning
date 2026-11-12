const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { canModerate } = require("../lib/permissions");
module.exports = {
 data: new SlashCommandBuilder().setName("timeout").setDescription("Temporarily prevent a member from chatting.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o=>o.setName("member").setDescription("Member to timeout").setRequired(true))
  .addIntegerOption(o=>o.setName("minutes").setDescription("Duration in minutes (1-40320)").setMinValue(1).setMaxValue(40320).setRequired(true))
  .addStringOption(o=>o.setName("reason").setDescription("Reason").setMaxLength(500)),
 async execute(i) {
  const user=i.options.getUser("member",true), member=await i.guild.members.fetch(user.id).catch(()=>null);
  if (!member || !canModerate(i,member)) return i.reply({content:"I can't timeout that member. Check role hierarchy and permissions.",ephemeral:true});
  const minutes=i.options.getInteger("minutes",true);
  await member.timeout(minutes*60*1000,i.options.getString("reason") || `Action by ${i.user.tag}`);
  await i.reply({content:`⏱️ Timed out **${user.tag}** for ${minutes} minute(s).`,ephemeral:true});
 }
};
