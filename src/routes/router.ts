import Router from '@koa/router'
import {botRouter} from './bot.js'
import {fileRouter} from './file.js'
import {notionRouter} from './notion.js'
import {btcpayRouter} from './btcpay.js'
import {payBitcoinRouter} from './pay-bitcoin.js'

export const router = new Router()
router.use(botRouter.routes())
router.use(fileRouter.routes())
router.use(notionRouter.routes())
router.use(btcpayRouter.routes())
router.use(payBitcoinRouter.routes())
