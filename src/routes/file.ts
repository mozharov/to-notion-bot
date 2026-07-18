import Router from '@koa/router'
import {bot} from '../bot/bot.js'
import {config} from '../config.js'
import {getFile} from '../models/files.js'
import {getChatById} from '../models/chats.js'
import {getUser} from '../models/users.js'
import {posthog} from '../lib/posthog.js'
import got from 'got'

export const fileRouter = new Router()
fileRouter.get('/file/:id/:fileId.:extension', async ctx => {
  const {id, fileId, extension} = ctx.params
  if (!id || !fileId || !extension) return ctx.throw(400, 'Invalid request')
  const check = /^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/
  if (!check.test(id)) return ctx.throw(400, 'Invalid request')

  const file = await getFile({id, fileId, extension})
  if (!file) return ctx.throw(404, 'File not found')

  const chat = file.chatId ? await getChatById(file.chatId) : null
  const owner = chat ? await getUser(chat.ownerId) : null
  if (owner) {
    posthog.capture({
      distinctId: owner.telegramId.toString(),
      event: 'file viewed',
      properties: {type: file.type, extension: file.extension, chatType: chat?.type},
    })
  }

  const tgFile = await bot.api.getFile(file.fileId)
  const fileUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${tgFile.file_path}`
  ctx.body = got.stream(fileUrl)
})
