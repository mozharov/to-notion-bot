import Router from '@koa/router'
import {getUser} from '../models/users.js'
import {config} from '../config.js'
import {
  countByOwner,
  createWorkspace,
  getWorkspaceByOwnerAndWorkspaceId,
  updateWorkspace,
} from '../models/notion-workspaces.js'
import {getChatByTelegramId} from '../models/chats.js'
import {bot} from '../bot/bot.js'
import {posthog} from '../lib/posthog.js'
import {translate} from '../bot/lib/i18n.js'

export const notionRouter = new Router()
notionRouter.get('/notion', async ctx => {
  const error = ctx.query.error
  const code = ctx.query.code
  const userId = ctx.query.state

  if (error === 'access_denied') {
    ctx.log.info('User denied access')
    ctx.body = 'User denied access for Notion'
    return
  } else if (error) {
    ctx.log.error({error}, 'Error while auth for Notion')
    return ctx.throw(500, 'Error while auth for Notion')
  }

  if (!code || typeof code !== 'string') return ctx.throw(400, 'Code is required')
  if (!userId || typeof userId !== 'string') return ctx.throw(400, 'State is required')

  const user = await getUser(userId)
  if (!user) return ctx.throw(400, 'User not found')

  const authToken = Buffer.from(
    `${config.NOTION_CLIENT_ID}:${config.NOTION_SECRET_TOKEN}`,
  ).toString('base64')
  const redirectUri = `http${config.NODE_ENV === 'development' ? '' : 's'}://${config.HOST}/notion`

  const response = await fetch(`https://api.notion.com/v1/oauth/token`, {
    body: JSON.stringify({
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${authToken}`,
    },
  })
  const data = (await response.json()) as {
    access_token: string
    workspace_id: string
    workspace_name?: string
    bot_id: string
    error?: string
  }
  if (data.error) {
    ctx.log.error({response: data}, 'Error while auth for Notion')
    return ctx.throw(500, 'Error while auth for Notion')
  }

  const workspace = await getWorkspaceByOwnerAndWorkspaceId(user.id, data.workspace_id)
  const countWorkspaces = await countByOwner(user.id)
  if (!workspace && countWorkspaces >= config.MAX_WORKSPACES_PER_USER) {
    return ctx.throw(
      400,
      'User has too many workspaces. Please delete one old workspace to create new one.',
    )
  }

  const workspaceData = {
    ownerId: user.id,
    accessToken: data.access_token,
    botId: data.bot_id,
    name: data.workspace_name ?? data.workspace_id,
    workspaceId: data.workspace_id,
  }

  if (workspace) await updateWorkspace({id: workspace.id, ...workspaceData})
  else await createWorkspace(workspaceData)

  const chat = await getChatByTelegramId(user.telegramId)
  if (chat) {
    await bot.api
      .sendMessage(user.telegramId, translate('notion-was-set', chat.languageCode), {
        parse_mode: 'HTML',
      })
      .catch((error: unknown) => {
        ctx.log.error({error}, 'Error while sending message to user')
      })
  } else ctx.log.warn('Chat not found')
  posthog.capture({
    distinctId: user.telegramId.toString(),
    event: 'completed notion integration',
  })
  ctx.redirect(`https://t.me/${config.BOT_USERNAME}`)
})
