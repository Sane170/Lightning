# ⚡ Lightning

Lightning is an all-in-one Discord bot built with Node.js and discord.js.

## Current features

- Slash-command framework with automatic command loading
- General commands: `/help`, `/ping`, `/serverinfo`, `/userinfo`
- Moderation: `/ban`, `/kick`, `/timeout`, `/warn`, `/warnings`, `/purge`
- SQLite storage for warning history and per-server AutoMod settings
- AutoMod protections for rapid spam, Discord invite links, and excessive mentions (disabled by default; configure with `/automod`)
- Private button-based support tickets with optional support-role access and close controls
- Permission checks and role-hierarchy safeguards for moderation actions

More modules—including tickets, automod, welcome tools, role panels, leveling, giveaways, applications, and a web dashboard—will be added in development stages.

## Requirements

- Node.js 22.12.0 or newer
- A Discord application and bot
- A host that supports a continuously running Node.js process
- Persistent storage for `data/lightning.sqlite`

## Setup

1. Download or clone this repository.
2. Install packages with `npm install`.
3. Copy `.env.example` to `.env`.
4. Fill in `DISCORD_TOKEN` and `CLIENT_ID`. For fast testing, add your test server's ID to `GUILD_ID`.
5. In the Discord Developer Portal, enable the **Server Members Intent** under Bot → Privileged Gateway Intents.
6. In the Discord Developer Portal, also enable **Message Content Intent** (required for AutoMod to inspect message text). Invite the bot with the `bot` and `applications.commands` scopes and the permissions needed for the features you use. AutoMod needs Manage Messages; timeouts additionally need Moderate Members. Ticket creation needs Manage Channels.
7. Register slash commands with `npm run deploy`.
8. Start Lightning with `npm start`.

Never share your bot token or commit your real `.env` file. Use your hosting provider's secret/environment-variable settings when deploying.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DISCORD_TOKEN` | Yes | Bot token |
| `CLIENT_ID` | Yes | Discord application ID |
| `GUILD_ID` | No | Test server ID for instant guild command registration |

## Development

- `npm run deploy` registers slash commands.
- `npm start` starts the bot.
- `data/lightning.sqlite` stores warning records and AutoMod settings. Keep this folder on persistent storage when hosting.

## Security

Lightning checks command permissions and moderation role hierarchy. Keep tokens in environment variables, use least-privilege bot permissions, and review moderation settings before inviting it to public servers.
