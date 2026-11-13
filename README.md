# ⚡ Lightning

Lightning is an all-in-one Discord bot built with Node.js and discord.js.

## Current features

- Slash-command framework with automatic command loading
- General commands: `/help`, `/ping`, `/serverinfo`, `/userinfo`
- Moderation: `/ban`, `/kick`, `/timeout`, `/warn`, `/warnings`, `/purge`
- AutoMod protections for rapid spam, Discord invite links, and excessive mentions (off by default; configure with `/automod`)
- Security suite with `/security`: visible honeypot channel, new-account alerts, join-spike detection, configurable raid threshold, manual raid mode, and security event history counters
- Raid mode applies stricter spam limits to members who joined in the last 10 minutes; it does not automatically ban or kick members
- Honeypot messages are deleted and logged; a 10-minute timeout is applied only when the triggering account is less than 3 days old, otherwise moderators review the alert
- Private button-based support tickets with support-role and channel-manager access
- Configurable welcome messages with `/welcome set`, `/welcome disable`, and `/welcome status`
- Server event logs for member joins, member leaves, and deleted-message metadata with `/logging`
- Interactive polls with up to four choices; members can change their vote, and staff can end polls with `/poll-end`
- Formatted announcements with `/announce`
- Member suggestions with `/suggest`, configurable destination via `/suggestion-config`, and staff approve/decline buttons
- XP leveling with a per-member message cooldown, level-up announcements, `/rank`, `/leaderboard`, and `/level-config`
- SQLite storage for warnings, AutoMod, security, ticket, welcome, logging, poll, and suggestion data
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
6. Also enable **Message Content Intent** for AutoMod and honeypot monitoring. Invite the bot with the `bot` and `applications.commands` scopes and only the permissions needed for the features you use:
   - Moderation: Ban Members, Kick Members, Moderate Members, and Manage Messages as needed.
   - AutoMod and honeypot: Manage Messages; Moderate Members if you want Lightning to apply eligible timeouts.
   - Security setup: Manage Channels to create the honeypot channel; View Channels, Send Messages, and Embed Links in the security log channel.
   - Tickets: Manage Channels.
   - Welcome and logs: View Channels and Send Messages in the selected channels.
   - Polls: Send Messages, Embed Links, Read Message History, and Manage Messages for creating/ending polls.
   - Announcements: Send Messages and Embed Links in the selected channel.
   - Suggestions: Send Messages and Embed Links in the configured suggestion channel; staff reviewers need Manage Server.
   - Leveling: Guild Messages intent; Lightning needs Send Messages and Embed Links where level-up announcements are posted.
7. Register slash commands with `npm run deploy`.
8. Start Lightning with `npm start`.

Never share your bot token or commit your real `.env` file. Use your hosting provider's secret/environment-variable settings when deploying.

## Security setup

1. Run `/security set-log-channel` and select a private moderator-only channel.
2. Run `/security setup-honeypot` to create the visible `#human-check` channel. Keep its purpose clear to members; staff are exempt.
3. Run `/security set-raid-threshold` to choose how many joins within the 20-second window trigger raid mode.
4. Use `/security status` to review the current configuration.
5. Use `/security raid-mode` to manually enable or disable heightened protection.

Honeypot channels are intentionally writable so a message can be detected. A human member may accidentally post there, so non-new accounts are logged for moderator review rather than automatically timed out. Configure permissions so only moderators can view the security log channel.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DISCORD_TOKEN` | Yes | Bot token |
| `CLIENT_ID` | Yes | Discord application ID |
| `GUILD_ID` | No | Test server ID for instant guild command registration |

## Development

- `npm run deploy` registers slash commands.
- `npm start` starts Lightning.
- `data/lightning.sqlite` stores server settings, security events, warning records, polls, suggestions, and member XP. Keep this folder on persistent storage when hosting.

## Privacy and security

- Deleted-message logs store the author, channel, and message ID—not the message text.
- Keep tokens in environment variables and use least-privilege bot permissions.
- Review AutoMod settings and server permissions before inviting Lightning to public servers.

Lightning is still in development and has not yet been live-tested with a Discord bot token.
