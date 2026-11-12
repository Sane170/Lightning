# ⚡ Lightning

Lightning is an all-in-one Discord bot built with Node.js and discord.js.

## Current features

- Slash-command framework with automatic command loading
- General commands: `/help`, `/ping`, `/serverinfo`, `/userinfo`
- Moderation: `/ban`, `/kick`, `/timeout`, `/warn`, `/warnings`, `/purge`
- AutoMod protections for rapid spam, Discord invite links, and excessive mentions (off by default; configure with `/automod`)
- Private button-based support tickets with support-role and channel-manager access
- Configurable welcome messages with `/welcome set`, `/welcome disable`, and `/welcome status`
- Server event logs for member joins, member leaves, and deleted-message metadata with `/logging`
- SQLite storage for warnings, AutoMod, ticket, welcome, and logging settings
- Permission checks and role-hierarchy safeguards for moderation actions

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
5. In the Discord Developer Portal, enable **Server Members Intent** under Bot → Privileged Gateway Intents.
6. Also enable **Message Content Intent** for AutoMod. Invite the bot with the `bot` and `applications.commands` scopes and only the permissions needed for the features you use:
   - Moderation: Ban Members, Kick Members, Moderate Members, and Manage Messages as needed.
   - AutoMod: Manage Messages; Moderate Members if you want Lightning to apply timeouts.
   - Tickets: Manage Channels.
   - Welcome and logs: View Channels and Send Messages in the selected channels.
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
- `data/lightning.sqlite` stores server settings and warning records. Keep this folder on persistent storage when hosting.

## Privacy and security

- Deleted-message logs store the author, channel, and message ID—not the message text.
- Keep tokens in environment variables and use least-privilege bot permissions.
- Review AutoMod settings and server permissions before inviting Lightning to public servers.

Lightning is still in development and has not yet been live-tested with a Discord bot token.
