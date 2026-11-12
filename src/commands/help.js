const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
 data: new SlashCommandBuilder().setName("help").setDescription("See Lightning's available commands."),
 async execute(interaction) {
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("⚡ Lightning Help")
   .setDescription("Your all-in-one server assistant. These are the commands currently available.")
   .addFields(
    { name:"General", value:"`/ping` `/help` `/serverinfo` `/userinfo`" },
    { name:"Moderation", value:"`/ban` `/kick` `/timeout` `/warn` `/warnings` `/purge`" },
    { name:"Auto moderation", value:"`/automod enable` `/automod disable` `/automod status`" }
   ).setFooter({ text:"More Lightning features are being built in stages." });
  await interaction.reply({ embeds:[embed], ephemeral:true });
 }
};
