## Updating Node.js and NPM versions

1. Update versions in `.github/workflows/build-and-lint.yml` and `.github/workflows/deploy-to-yandex-cloud.yml`.
2. Update versions in `package.json` in the `engines` section.
3. Update versions in `Dockerfile`.
4. Update versions in `.devcontainer/Dockerfile`.

## Webhook

Domain and SSL certificate are required to set up a webhook.

Use ngrok to create a public URL for the bot in development.

```bash
ngrok config add-authtoken <authtoken>
ngrok http 8443
```

Send a POST request to Bot API to set a webhook url.
https://core.telegram.org/bots/api#making-requests
https://core.telegram.org/bots/api#setwebhook

Example:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"url": "https://<webhook_url>", "secret_token": "<webhook_token>"}' https://api.telegram.org/bot<bot_token>/setWebhook
```

# Migrations

### Generate new migration

1. clear the postgres database of the application
2. `npm run migration:run`
3. `npm run migration:generate`
4. add the new migration module to `src/typeorm/typeorm.migration.options.ts`

### Run migration

`npm run migration:run`

### Revert migration

`npm run migration:revert`
