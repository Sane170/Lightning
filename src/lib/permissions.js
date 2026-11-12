const { PermissionFlagsBits } = require("discord.js");
function hasPermission(member, permission) {
  return Boolean(member?.permissions?.has(permission));
}
function canModerate(interaction, target) {
  if (!hasPermission(interaction.member, PermissionFlagsBits.ModerateMembers) &&
      !hasPermission(interaction.member, PermissionFlagsBits.KickMembers) &&
      !hasPermission(interaction.member, PermissionFlagsBits.BanMembers)) return false;
  if (target?.id === interaction.guild.ownerId) return false;
  if (target?.id === interaction.user.id) return false;
  const botMember = interaction.guild.members.me;
  if (target && botMember && target.roles.highest.comparePositionTo(botMember.roles.highest) >= 0) return false;
  if (target && interaction.member.roles.highest.comparePositionTo(target.roles.highest) <= 0 &&
      interaction.guild.ownerId !== interaction.user.id) return false;
  return true;
}
module.exports = { hasPermission, canModerate };
