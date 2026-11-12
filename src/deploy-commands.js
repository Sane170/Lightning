require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { REST, Routes } = require("discord.js");

async function main() {
  const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
  if (!DISCORD_TOKEN || !CLIENT_ID) throw new Error("DISCORD_TOKEN and CLIENT_ID are required.");
  const commands = [];
  const dir = path.join(__dirname, "commands");
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(dir, file));
    if (command.data) commands.push(command.data.toJSON());
  }
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);
  await rest.put(route, { body: commands });
  console.log(`Registered ${commands.length} Lightning slash commands ${GUILD_ID ? "to the test server" : "globally"}.`);
}
main().catch(error => { console.error("Command registration failed:", error); process.exit(1); });
