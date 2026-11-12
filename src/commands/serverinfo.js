const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
 data: new SlashCommandBuilder().setName("serverinfo").setDescription("View information about this server."),
 async execute(interaction) {
  const g = interaction.guild;
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle(g.name)
   .setThumbnail(g.iconURL({ size:256 }))
   .addFields(
    { name:"Members", value:String(g.memberCount), inline:true },
    { name:"Created", value:`<t:${Math.floor(g.createdTimestamp/1000)}:D>`, inline:true },
    { name:"Owner", value:`<@${g.ownerId}>`, inline:true },
    { name:"Channels", value:String(g.channels.cache.size), inline:true },
    { name:"Roles", value:String(g.roles.cache.size), inline:true },
    { name:"Boosts", value:String(g.premiumSubscriptionCount ?? 0), inline:true }
   );
  await interaction.reply({ embeds:[embed] });
 }
};
