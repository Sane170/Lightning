const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../lib/database");
module.exports = {
 data: new SlashCommandBuilder().setName("warn").setDescription("Record a warning for a member.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o=>o.setName("member").setDescription("Member to warn").setRequired(true))
  .addStringOption(o=>o.setName("reason").setDescription("Reason for warning").setRequired(true).setMaxLength(500)),
 async execute(i) {
  const user=i.options.getUser("member",true), reason=i.options.getString("reason",true);
  if (user.bot || user.id===i.user.id || user.id===i.guild.ownerId) return i.reply({content:"That member cannot be warned.",ephemeral:true});
  const result=db.prepare("INSERT INTO warnings (guild_id,user_id,moderator_id,reason) VALUES (?,?,?,?)").run(i.guildId,user.id,i.user.id,reason);
  await i.reply({content:`⚠️ Warning #${result.lastInsertRowid} recorded for **${user.tag}**.`,ephemeral:true});
 }
};
