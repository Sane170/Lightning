const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
 data: new SlashCommandBuilder().setName("leaderboard").setDescription("Show the server's top 10 members by XP."),
 async execute(interaction) {
  const db = require("../lib/database");
  const rows = db.prepare("SELECT user_id, xp FROM levels WHERE guild_id = ? ORDER BY xp DESC LIMIT 10").all(interaction.guildId);
  if (!rows.length) return interaction.reply({ content: "No one has earned XP yet. Start chatting to appear here!", ephemeral: true });
  const lines = await Promise.all(rows.map(async (row, index) => {
   const user = await interaction.client.users.fetch(row.user_id).catch(() => null);
   const level = Math.floor(Math.sqrt(row.xp / 100));
   return "**" + (index + 1) + ".** " + (user ? user.username : "Unknown member") + " — Level " + level + " (" + row.xp.toLocaleString() + " XP)";
  }));
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("🏆 Server XP Leaderboard").setDescription(lines.join("\n"));
  await interaction.reply({ embeds: [embed] });
 }
};
