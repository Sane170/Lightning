const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../lib/database");
function levelFor(xp) { return Math.floor(Math.sqrt(xp / 100)); }
module.exports = {
 data: new SlashCommandBuilder().setName("rank").setDescription("View your or another member's XP and level.")
  .addUserOption(o => o.setName("member").setDescription("Member to check").setRequired(false)),
 async execute(interaction) {
  const user = interaction.options.getUser("member") || interaction.user;
  const row = db.prepare("SELECT xp FROM levels WHERE guild_id = ? AND user_id = ?").get(interaction.guildId, user.id) || { xp: 0 };
  const level = levelFor(row.xp);
  const currentFloor = level * level * 100;
  const nextFloor = (level + 1) * (level + 1) * 100;
  const progress = row.xp - currentFloor;
  const needed = nextFloor - currentFloor;
  const percent = Math.min(100, Math.floor(progress / needed * 100));
  const filled = Math.round(percent / 10);
  const bar = "█".repeat(filled) + "░".repeat(10 - filled);
  const place = db.prepare("SELECT COUNT(*) AS count FROM levels WHERE guild_id = ? AND xp > ?").get(interaction.guildId, row.xp).count + 1;
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("⚡ " + user.username + "'s Rank")
   .setThumbnail(user.displayAvatarURL({ size: 256 }))
   .addFields(
    { name: "Level", value: String(level), inline: true },
    { name: "Total XP", value: row.xp.toLocaleString(), inline: true },
    { name: "Server Rank", value: "#" + place, inline: true },
    { name: "Progress to Level " + (level + 1), value: bar + " " + percent + "%\n" + progress + " / " + needed + " XP" }
   );
  await interaction.reply({ embeds: [embed] });
 }
};
