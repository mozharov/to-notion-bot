import {parseEnv, z} from 'znv'
import 'dotenv/config'
import type {UserFromGetMe} from 'grammy/types'

export const config = {
  ...parseEnv(process.env, {
    NODE_ENV: z.enum(['development', 'production']).default('production'),
    PORT: z.coerce.number().default(8443),
    BOT_TOKEN: z.string().nonempty(),
    BOT_WEBHOOK_SECRET: z.string().nonempty(),
    NGROK_TOKEN: z.string().optional(),
    BOT_ID: z.number().optional(),
    BOT_NAME: z.string().optional(),
    BOT_USERNAME: z.string().optional(),
    POSTHOG_API_KEY: z.string().optional(),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
    DB_URL: z.string().nonempty(),
    DB_MIGRATE: z.boolean().default(true),
    MAX_CHATS_PER_USER: z.number().default(90),
    MAX_WORKSPACES_PER_USER: z.number().default(90),
    NOTION_CLIENT_ID: z.string().nonempty(),
    NOTION_SECRET_TOKEN: z.string().nonempty(),
    HOST: z.string().nonempty(),
    BTCPAY_INSTANCE_URL: z.string().nonempty(),
    BTCPAY_API_KEY: z.string().nonempty(),
    BTCPAY_STORE_ID: z.string().nonempty(),
    BTCPAY_WEBHOOK_SECRET: z.string().nonempty(),
    LIFETIME_ACCESS_PRICE: z.number().default(25000), // in sats
  }),

  get botInfo(): UserFromGetMe | undefined {
    if (!this.BOT_ID || !this.BOT_NAME || !this.BOT_USERNAME) return undefined
    return {
      id: this.BOT_ID,
      first_name: this.BOT_NAME,
      username: this.BOT_USERNAME,
      is_bot: true,
      supports_inline_queries: false,
      can_read_all_group_messages: true,
      can_join_groups: true,
      can_connect_to_business: false,
      has_main_web_app: false,
    }
  },
}
