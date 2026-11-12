const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
 data: new SlashCommandBuilder().setName("userinfo").setDescription("View information about a server member.")
  .addUserOption(o => o.setName("member").setDescription("The member to look up.").setRequired(false)),
 async execute(interaction) {
  const user = interaction.options.getUser("member") || interaction.user;
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  const embed = new EmbedBuilder().setColor(0x258BFF).setTitle(user.tag)
   .setThumbnail(user.displayAvatarURL({ size:256 }))
   .addFields(
    { name:"User ID", value:user.id },
    { name:"Account created", value:`<t:${Math.floor(user.createdTimestamp/1000)}:D>`, inline:true },
    { name:"Joined server", value:member ? `<t:${Math.floor(member.joinedTimestamp/1000)}:D>` : "Not available", inline:true },
    { name:"Roles", value:member ? (member.roles.cache.filter(r=>r.id!==interaction.guild.id).map(r=>r.toString()).join(", ").slice(0,1000) || "None") : "Not available" }
   );
  await interaction.reply({ embeds:[embed] });
 }
};
