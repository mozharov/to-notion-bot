import {Router} from 'express'
import {LoggerService} from '../../../logger/logger.service'
import {usersService} from '../../../users/users.service'
import {config} from '../../../config/config.service'
import {bot, botInfo} from '../../../bot'
import {utils} from '../../../utils/utils.service'
import {NotionAuthResponse} from '../models/notion-auth-response.model'
import {notionWorkspacesService} from '../notion-workspaces.service'
import {translate} from '../../../i18n/i18n.helper'
import {chatsService} from '../../../chats/chats.service'
import { analytics } from '../../../analytics/analytics.service'

const logger = new LoggerService('NotionWorkspacesRouter')

export const notionWorkspacesRouter = Router()

notionWorkspacesRouter.route('/notion').get(async (req, res) => {
  const error = req.query['error']
  const code = req.query['code']
  const userId = req.query['state']

  if (error === 'access_denied') {
    logger.info('User denied access')
    res.status(200).send('User denied access for Notion')
    return
  } else if (error) {
    logger.error('Error while auth for Notion', error)
    res.status(500).send('Error while auth for Notion')
  }

  if (!code || typeof code !== 'string') {
    logger.warn('Code is required')
    res.status(400).send('Code is required')
    return
  }
  if (!userId || typeof userId !== 'string') {
    logger.warn('State is required')
    res.status(400).send('State is required')
    return
  }

  const user = await usersService.findUserById(userId)
  if (!user) {
    logger.warn('User not found')
    res.status(400).send('User not found')
    return
  }
  const authToken = Buffer.from(
    `${config.get('NOTION_CLIENT_ID')}:${config.get('NOTION_SECRET_TOKEN')}`,
  ).toString('base64')
  const redirectUri =
    config.get('NODE_ENV') === 'development'
      ? `http://localhost:${config.get('PORT')}/notion`
      : `https://${config.get('ORIGIN_DOMAIN')}/notion`

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
  const body = await response.json()
  const data = await utils.transformData(body, NotionAuthResponse)

  const workspace = await notionWorkspacesService.findOneByOwnerAndWorkspaceId(
    user,
    data.workspace_id,
  )
  const countWorkspaces = await notionWorkspacesService.countByOwner(user)
  if (!workspace && countWorkspaces >= config.get('MAX_WORKSPACES_PER_USER')) {
    logger.warn('User has too many workspaces')
    res
      .status(400)
      .send('User has too many workspaces. Please delete one old workspace to create new one.')
    return
  }

  const workspaceData = {
    owner: user,
    accessToken: data.access_token,
    botId: data.bot_id,
    name: data.workspace_name ?? data.workspace_id,
    workspaceId: data.workspace_id,
  }

  logger.debug(workspace)
  if (workspace) {
    Object.assign(workspace, workspaceData)
    await workspace.save()
  } else {
    await notionWorkspacesService.createWorkspace(workspaceData)
  }

  const chat = await chatsService.findChatByTelegramId(user.telegramId)

  if (chat) {
    await bot.api
      .sendMessage(user.telegramId, translate('notion-was-set', chat.languageCode), {
        parse_mode: 'HTML',
      })
      .catch(logger.error)
  } else logger.warn('Chat not found')

  analytics.track('completed notion integration', user.telegramId)
  res.redirect(`https://t.me/${botInfo.username}`)
})
