const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("../lib/database");
const choices = [
 { name: "Spam protection", value: "spam" },
 { name: "Discord invite links", value: "invites" },
 { name: "Mention spam", value: "mentions" }
];
module.exports = {
 data: new SlashCommandBuilder().setName("automod").setDescription("Configure Lightning's automatic moderation.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s => s.setName("enable").setDescription("Enable an AutoMod protection.")
   .addStringOption(o => o.setName("feature").setDescription("Protection to enable").setRequired(true).addChoices(...choices)))
  .addSubcommand(s => s.setName("disable").setDescription("Disable an AutoMod protection.")
   .addStringOption(o => o.setName("feature").setDescription("Protection to disable").setRequired(true).addChoices(...choices)))
  .addSubcommand(s => s.setName("status").setDescription("View this server's AutoMod settings.")),
 async execute(i) {
  const guildId = i.guildId;
  db.prepare("INSERT OR IGNORE INTO automod_settings (guild_id) VALUES (?)").run(guildId);
  const sub = i.options.getSubcommand();
  if (sub === "status") {
   const s = db.prepare("SELECT * FROM automod_settings WHERE guild_id = ?").get(guildId);
   const label = value => value ? "Enabled" : "Disabled";
   const embed = new EmbedBuilder().setColor(0x258BFF).setTitle("⚡ Lightning AutoMod")
    .addFields(
     { name: "Spam protection", value: label(s.spam_enabled), inline: true },
     { name: "Invite links", value: label(s.invites_enabled), inline: true },
     { name: "Mention spam", value: label(s.mentions_enabled), inline: true }
    ).setFooter({ text: "Settings are saved separately for each server." });
   return i.reply({ embeds: [embed], ephemeral: true });
  }
  const feature = i.options.getString("feature", true);
  const column = { spam: "spam_enabled", invites: "invites_enabled", mentions: "mentions_enabled" }[feature];
  const enabled = sub === "enable" ? 1 : 0;
  db.prepare("UPDATE automod_settings SET " + column + " = ? WHERE guild_id = ?").run(enabled, guildId);
  const name = choices.find(item => item.value === feature).name;
  await i.reply({ content: (enabled ? "✅ Enabled " : "Disabled ") + "**" + name + "** for this server.", ephemeral: true });
 }
};
