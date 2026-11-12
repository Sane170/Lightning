const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../lib/database");

module.exports = client => {
 client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  const match = interaction.customId.match(/^lightning:poll:([a-f0-9]+):(\d+)$/);
  if (!match) return;
  const [, id, rawIndex] = match;
  const poll = db.prepare("SELECT * FROM polls WHERE id = ? AND guild_id = ?").get(id, interaction.guildId);
  if (!poll || poll.status !== "open") return interaction.reply({ content: "This poll is no longer active.", ephemeral: true });
  const options = JSON.parse(poll.options);
  const index = Number(rawIndex);
  if (!Number.isInteger(index) || index < 0 || index >= options.length) return interaction.reply({ content: "That poll option is invalid.", ephemeral: true });

  db.prepare("INSERT INTO poll_votes (poll_id, user_id, option_index) VALUES (?, ?, ?) ON CONFLICT(poll_id, user_id) DO UPDATE SET option_index = excluded.option_index")
   .run(id, interaction.user.id, index);
  const counts = options.map((_, n) => db.prepare("SELECT COUNT(*) AS total FROM poll_votes WHERE poll_id = ? AND option_index = ?").get(id, n).total);
  const total = counts.reduce((a,b) => a+b, 0);
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("📊 " + poll.question)
   .setDescription(options.map((option,n) => {
    const count = counts[n];
    const percent = total ? Math.round(count / total * 100) : 0;
    return "**"+(n+1)+".** "+option+" — **"+count+"** ("+percent+"%)";
   }).join("\n"))
   .setFooter({ text: "Lightning Poll • "+total+" total vote"+(total === 1 ? "" : "s")+" • You can change your vote" });
  const row = new ActionRowBuilder().addComponents(options.map((option,n) =>
   new ButtonBuilder().setCustomId("lightning:poll:"+id+":"+n).setLabel(option).setStyle(ButtonStyle.Primary)
  ));
  await interaction.update({ embeds:[embed], components:[row] });
 });
};
