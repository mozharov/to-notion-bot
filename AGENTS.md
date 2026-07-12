# AGENTS.md

This file provides guidance when working with code in this repository.

## What this is

A Telegram bot ("To Notion Bot") that forwards messages, files, contacts, and checklists from Telegram chats into Notion databases/pages. Users connect a Notion workspace via OAuth, pick a database per Telegram chat, and every message sent in that chat becomes (or updates) a Notion page.

## Commands

```bash
npm run start:dev      # run with nodemon + ts-node against src/, DEBUG=grammy* for grammY debug logs
npm run build           # clean, tsc compile, copy locales (*.ftl) and assets into dist/
npm start                # run compiled dist/main.js
npm run lint             # eslint .
npm run format           # prettier --write src
```

There is no test suite in this repo (no test runner configured).

Database migrations (Drizzle + better-sqlite3):
```bash
npx drizzle-kit generate   # generate a new migration from schema.ts changes into ./drizzle
```
Migrations run automatically on boot via `migrateDatabase()` in [src/main.ts](src/main.ts) when `DB_MIGRATE=true` (default).

Required environment variables are declared/validated in [src/config.ts](src/config.ts) via `znv`/`zod` (`BOT_TOKEN`, `BOT_WEBHOOK_SECRET`, `DB_URL`, `NOTION_CLIENT_ID`, `NOTION_SECRET_TOKEN`, `HOST`, `TG_ADMIN_ID`, etc.). There's no `.env.example` in the repo — check `config.ts` for the full list when setting up a local environment.

## Architecture

### Process entry and transport

- [src/main.ts](src/main.ts) is the entrypoint: runs DB migrations, starts the Koa HTTP server ([src/app.ts](src/app.ts)), then initializes the grammY bot and cron jobs once the server is listening. In development, if `NGROK_TOKEN` is set it opens an ngrok tunnel and registers it as the Telegram webhook; in production the webhook is expected to be set externally against `HOST`.
- The bot does **not** long-poll — it only receives updates via Telegram webhook POSTs to `/bot`, handled by [src/routes/bot.ts](src/routes/bot.ts) → [src/middlewares/bot-webhook-callback.ts](src/middlewares/bot-webhook-callback.ts) → grammY's webhook callback for `bot` ([src/bot/bot.ts](src/bot/bot.ts)).
- Koa also serves `/notion` (OAuth callback, [src/routes/notion.ts](src/routes/notion.ts)) and `/file/:id/:fileId.:extension` (proxies Telegram file downloads so Notion can embed a stable URL, [src/routes/file.ts](src/routes/file.ts)). All routes are registered in [src/routes/router.ts](src/routes/router.ts).

### Bot composer structure (grammY)

[src/bot/bot.ts](src/bot/bot.ts) wires an `errorBoundary` around a chain of composers/middlewares, in order: logger/tracker context → `pre_checkout_query` → i18n → `identifyUser` (creates/loads the `User` row) → successful-payment handler → `privateChats` route → `groupsAndChannels` route → a shared message composer for `:text`/`:caption`/`:file`/`:contact`/`:checklist` updates.

- [src/bot/routes/private-chats.ts](src/bot/routes/private-chats.ts) holds all commands (`/start`, `/help`, `/chats`, `/workspaces`, `/refund`, `/feedback`, admin-only `/promocode`, `/remove_promocode`, `/give`) and every inline-keyboard callback (workspace/chat settings, Notion database linking, subscription payment, etc.). Callback data is regex-matched on UUID/chat-id patterns embedded in the button payload (e.g. `chat:(-?\d+):notion:(uuid)`).
- [src/bot/routes/groups-and-channels.ts](src/bot/routes/groups-and-channels.ts) only handles `my_chat_member` to block/unblock a chat's record when the bot is added/removed.
- Multi-step interactive flows (e.g. "paste a Notion page URL to link") are modeled as **session state** rather than grammY conversations: [src/bot/services/session.ts](src/bot/services/session.ts) persists a `State` (`{action, ...params}`) per Telegram user in the `sessions` table, and [src/bot/middlewares/handle-state-actions.ts](src/bot/middlewares/handle-state-actions.ts) dispatches the next matching text message to the right handler in `src/bot/handlers/actions/` based on `state.action`.
- Actual message-forwarding logic lives in [src/bot/handlers/message.ts](src/bot/handlers/message.ts): it resolves the chat's linked Notion workspace/database, converts the Telegram message (text w/ entities, checklist, contact, file, reply-to context) into Notion `BlockObjectRequest[]` via [src/bot/helpers/notion-block.ts](src/bot/helpers/notion-block.ts), and either creates a new Notion page or appends blocks to the page from a previous message in the same "thread" (edits/replies update the existing Notion page instead of creating a new one — see [src/bot/helpers/prev-message.ts](src/bot/helpers/prev-message.ts)).
- Errors thrown in handlers propagate to [src/bot/handlers/error.ts](src/bot/handlers/error.ts). Throw a `KnownError` ([src/bot/errors/known-error.ts](src/bot/errors/known-error.ts)) with a translation key to show a localized, user-facing message; anything else surfaces as a generic `error.unknown` message and is logged.

### Data layer

- SQLite via `better-sqlite3` + Drizzle ORM. Schema lives entirely in [src/lib/database/schema.ts](src/lib/database/schema.ts); tables: `users`, `chats`, `notion_workspaces`, `notion_databases`, `messages`, `files`, `sessions`, `invoices`, `promocodes`, `promocodes_users`.
- `chats` is the central entity: each Telegram chat (private/group/channel) has an `ownerId` (a `users` row), and optionally a `notionWorkspaceId` + `notionDatabaseId` once configured. `chats.status` gates whether messages are actually forwarded.
- `messages` maps a Telegram message (by `telegramMessageId` + `chatId`) to the Notion `notionPageId` it produced — this is how replies/edits know to update rather than recreate a Notion page.
- One module per table under `src/models/` (`src/models/chats.ts`, etc.) — these are the only place raw Drizzle queries should live; handlers/services call into these instead of importing `db` directly. Several models return "extended" types that left-join related tables (see `ExtendedChat` in [src/models/chats.ts](src/models/chats.ts)).
- Migrations are hand-generated by drizzle-kit into `./drizzle` and applied by `migrateDatabase()`; don't hand-edit generated SQL files, regenerate from schema changes instead.

### Notion integration

- [src/lib/notion-client.ts](src/lib/notion-client.ts) wraps `@notionhq/client`. All calls go through a shared `Bottleneck` limiter (`maxConcurrent: 1`, `minTime: 340ms`) to stay under Notion's rate limits — reuse `limitter` for any new Notion API call rather than calling the SDK directly.
- Each chat's `notion_workspaces` row stores the OAuth `accessToken` obtained from the `/notion` OAuth callback route; a `NotionClient` is constructed per-request with that chat's token (see usage in [src/bot/handlers/message.ts](src/bot/handlers/message.ts)).

### Cross-cutting concerns

- **i18n**: `@grammyjs/i18n` backed by Fluent (`.ftl`) files in `src/bot/locales/` (`en`, `ru`). Use `ctx.t(key, params)` inside grammY middleware, or `translate(key, languageCode, params)` from [src/bot/lib/i18n.ts](src/bot/lib/i18n.ts) outside of request context (e.g. in `src/routes/notion.ts`, cron tasks). `chats.languageCode` stores the per-chat preference.
- **Logging**: `pino`, configured in [src/lib/logger.ts](src/lib/logger.ts); a per-request/per-update child logger is attached as `ctx.log` (bot) / `ctx.log` (Koa, via `request-logger` middleware) — prefer this over importing the root `logger` inside request-scoped code.
- **Analytics**: PostHog ([src/lib/posthog.ts](src/lib/posthog.ts)), accessed in bot middleware as `ctx.tracker.capture(event, props)` ([src/bot/lib/tracker.ts](src/bot/lib/tracker.ts)) and directly as `posthog.capture(...)` in plain routes.
- **Type augmentation**: grammY's `Context` is extended (i18n flavor + `log`, `tracker`, `state`) in [src/declarations/bot.d.ts](src/declarations/bot.d.ts); Koa's context is similarly extended in [src/declarations/koa.d.ts](src/declarations/koa.d.ts).
- **Cron**: [src/services/cron/cron.ts](src/services/cron/cron.ts) uses `node-cron`, guarded by an in-memory `isRunning` flag to prevent overlap. Add new scheduled jobs here and put the task body under `src/services/cron/tasks/`.
- **Payments**: subscriptions are sold via Telegram Stars (native Telegram payments) — see `pay-telegram-stars`/`refund` callbacks and `pre-checkout-query`/`successful-payment` handlers. The `invoices` table still has a legacy `btcpayInvoiceId` column from a removed BTCPay integration; new payment code should only use the `telegramInvoiceId`/`XTR` (Stars) path.

## Conventions

- ESM throughout (`"type": "module"`); relative imports must use explicit `.js` extensions (even though source is `.ts`) to satisfy `Node16` module resolution.
- No semicolons, single quotes, no bracket spacing — enforced by Prettier ([.prettierrc](.prettierrc)); run `npm run format` before committing.
- ESLint uses `typescript-eslint`'s `strictTypeChecked`/`stylisticTypeChecked` configs — new code should satisfy strict type-checked linting (no unsafe `any` usage, exhaustive checks, etc.).
- IDs for DB rows are UUIDs generated with `randomUUID()` at insert time (not auto-increment), matching the UUID regexes used in callback-data routing.
