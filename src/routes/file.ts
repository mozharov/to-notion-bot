import Router from '@koa/router'
import {bot} from '../bot/bot.js'
import {config} from '../config.js'
import {getFile} from '../models/files.js'
import got from 'got'

export const fileRouter = new Router()
fileRouter.get('/file/:id/:fileId.:extension', async ctx => {
  const {id, fileId, extension} = ctx.params
  if (!id || !fileId || !extension) return ctx.throw(400, 'Invalid request')
  const check = /^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/
  if (!check.test(id)) return ctx.throw(400, 'Invalid request')

  const file = await getFile({id, fileId, extension})
  if (!file) return ctx.throw(404, 'File not found')
  const tgFile = await bot.api.getFile(file.fileId)
  const fileUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${tgFile.file_path}`
  ctx.body = got.stream(fileUrl)
})
