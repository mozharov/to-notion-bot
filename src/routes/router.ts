import Router from '@koa/router'
import {botRouter} from './bot.js'
import {fileRouter} from './file.js'
import {notionRouter} from './notion.js'
import {healthRouter} from './health.js'

export const router = new Router()
router.use(healthRouter.routes())
router.use(botRouter.routes())
router.use(fileRouter.routes())
router.use(notionRouter.routes())
