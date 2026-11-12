const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../lib/database");

module.exports = {
 data: new SlashCommandBuilder().setName("poll-end").setDescription("End an active poll in this channel.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption(o => o.setName("message-id").setDescription("Message ID of the poll to end.").setRequired(true)),
 async execute(i) {
  const messageId = i.options.getString("message-id");
  const poll = db.prepare("SELECT * FROM polls WHERE guild_id = ? AND channel_id = ? AND message_id = ? AND status = 'open'")
   .get(i.guildId, i.channelId, messageId);
  if (!poll) return i.reply({ content: "I couldn't find an active Lightning poll with that message ID in this channel.", ephemeral: true });
  const options = JSON.parse(poll.options);
  const counts = options.map((_, n) => db.prepare("SELECT COUNT(*) AS total FROM poll_votes WHERE poll_id = ? AND option_index = ?").get(poll.id, n).total);
  const total = counts.reduce((a,b) => a+b, 0);
  const embed = new EmbedBuilder().setColor(0x64748B).setTitle("📊 "+poll.question)
   .setDescription(options.map((option,n) => {
    const count = counts[n];
    const percent = total ? Math.round(count / total * 100) : 0;
    return "**"+(n+1)+".** "+option+" — **"+count+"** ("+percent+"%)";
   }).join("\n"))
   .setFooter({ text: "Poll ended • "+total+" total vote"+(total === 1 ? "" : "s") }).setTimestamp();
  const message = await i.channel.messages.fetch(messageId);
  await message.edit({ embeds:[embed], components:[] });
  db.prepare("UPDATE polls SET status = 'closed' WHERE id = ?").run(poll.id);
  await i.reply({ content: "Poll ended successfully.", ephemeral: true });
 }
};
