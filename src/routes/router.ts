import Router from '@koa/router'
import {botRouter} from './bot.js'
import {fileRouter} from './file.js'
import {notionRouter} from './notion.js'

export const router = new Router()
router.use(botRouter.routes())
router.use(fileRouter.routes())
router.use(notionRouter.routes())
