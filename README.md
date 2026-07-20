# To Notion Bot: Send Messages and Files from Telegram to Notion

<div align="center">
  <a href="https://t.me/to_notion_robot">
    <img src="https://img.shields.io/badge/RUN-Telegram%20Bot-blue?logo=telegram&style=for-the-badge" alt="Run Telegram Bot" width="250">
  </a>
</div>

## Features

- Instant message sending from Telegram to Notion
- Update already added messages
- Send files of any type
- Preserve text formatting
- Group chat support
- Connect multiple Notion databases to different chats

## Bot Commands

- `/start` - Start the bot
- `/help` - Show help message
- `/chats` - Show all connected chats
- `/workspaces` - Show all connected Notion workspaces

## Development

The project requires [Bun](https://bun.sh/) 1.3 or newer.

```bash
bun install
bun run start:dev
```

Environment variables are validated in [`src/config.ts`](src/config.ts). Production builds and database migrations can be run with:

```bash
bun run build
bunx drizzle-kit generate
```

## Community

[![Telegram Chat](https://img.shields.io/badge/Telegram-Chat-blue?logo=telegram)](https://t.me/to_notion_chat)
