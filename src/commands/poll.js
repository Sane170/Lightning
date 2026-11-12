const { randomUUID } = require("node:crypto");
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const db = require("../lib/database");

module.exports = {
 data: new SlashCommandBuilder().setName("poll").setDescription("Create an interactive community poll.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption(o => o.setName("question").setDescription("What are you asking?").setMaxLength(180).setRequired(true))
  .addStringOption(o => o.setName("option1").setDescription("First choice").setMaxLength(80).setRequired(true))
  .addStringOption(o => o.setName("option2").setDescription("Second choice").setMaxLength(80).setRequired(true))
  .addStringOption(o => o.setName("option3").setDescription("Optional third choice").setMaxLength(80))
  .addStringOption(o => o.setName("option4").setDescription("Optional fourth choice").setMaxLength(80)),
 async execute(i) {
  const question = i.options.getString("question");
  const options = [1,2,3,4].map(n => i.options.getString("option"+n)).filter(Boolean);
  if (new Set(options.map(x => x.toLowerCase())).size !== options.length) {
   return i.reply({ content: "Please make each poll option different.", ephemeral: true });
  }
  const id = randomUUID().replaceAll("-", "").slice(0, 16);
  db.prepare("INSERT INTO polls (id, guild_id, channel_id, question, options) VALUES (?, ?, ?, ?, ?)")
   .run(id, i.guildId, i.channelId, question, JSON.stringify(options));
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("📊 " + question)
   .setDescription(options.map((option,n) => "**"+(n+1)+".** "+option+" — **0 votes**").join("\n"))
   .setFooter({ text: "Lightning Poll • Click one option to vote" }).setTimestamp();
  const row = new ActionRowBuilder().addComponents(options.map((option,n) =>
   new ButtonBuilder().setCustomId("lightning:poll:"+id+":"+n).setLabel(option).setStyle(ButtonStyle.Primary)
  ));
  const message = await i.channel.send({ embeds:[embed], components:[row] });
  db.prepare("UPDATE polls SET message_id = ? WHERE id = ?").run(message.id, id);
  await i.reply({ content: "Your poll has been posted!", ephemeral: true });
 }
};
