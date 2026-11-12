const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../lib/database");
module.exports = {
 data: new SlashCommandBuilder().setName("warnings").setDescription("View a member's warning history.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(o=>o.setName("member").setDescription("Member to check").setRequired(true)),
 async execute(i) {
  const user=i.options.getUser("member",true);
  const rows=db.prepare("SELECT id, moderator_id, reason, created_at FROM warnings WHERE guild_id=? AND user_id=? ORDER BY id DESC LIMIT 10").all(i.guildId,user.id);
  const embed=new EmbedBuilder().setColor(0x258BFF).setTitle(`Warnings: ${user.tag}`);
  if (!rows.length) embed.setDescription("No warnings recorded.");
  else embed.setDescription(rows.map(r=>`**#${r.id}** — ${r.reason}\nModerator: <@${r.moderator_id}> • ${r.created_at}`).join("\n\n").slice(0,4000));
  await i.reply({embeds:[embed],ephemeral:true});
 }
};
