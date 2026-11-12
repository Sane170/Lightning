const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
module.exports = {
 data: new SlashCommandBuilder().setName("purge").setDescription("Delete recent messages in this channel.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption(o=>o.setName("amount").setDescription("Number of messages (1-100)").setMinValue(1).setMaxValue(100).setRequired(true)),
 async execute(i) {
  const amount=i.options.getInteger("amount",true);
  const deleted=await i.channel.bulkDelete(amount,true);
  await i.reply({content:`🧹 Deleted ${deleted.size} message(s). Messages older than 14 days cannot be bulk-deleted.`,ephemeral:true});
 }
};
