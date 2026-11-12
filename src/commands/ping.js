const { SlashCommandBuilder } = require("discord.js");
module.exports = {
 data: new SlashCommandBuilder().setName("ping").setDescription("Check Lightning's response time."),
 async execute(interaction) {
  await interaction.reply({ content: `⚡ Pong! API latency: ${interaction.client.ws.ping}ms`, ephemeral: true });
 }
};
