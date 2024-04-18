import {Router} from 'express'
import {LoggerService} from '../../../logger/logger.service'
import {usersService} from '../../../users/users.service'
import {config} from '../../../config/config.service'
import {bot} from '../../../bot'
import {utils} from '../../../utils/utils.service'
import {NotionAuthResponse} from '../models/notion-auth-response.model'

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
  // https://developers.notion.com/docs/authorization#step-3-send-the-code-in-a-post-request-to-the-notion-api
  // https://github.com/mozharov/tg-notion-inbox-bot-backend/blob/main/src/services/notion-api/index.ts
  // https://www.notion.so/my-integrations/public/1170e88caf4c42dbae09ff0161bc156c

  // TODO: учесть лимит в 90 интеграций с Notion на аккаунт

  // TODO: сохранить workspace в базе
  //   await notionWorkspacesService.createWorkspace({
  //     owner: user,
  //   })

  res.redirect(`https://t.me/${bot.botInfo.username}`)
})
