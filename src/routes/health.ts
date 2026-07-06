import Router from '@koa/router'

export const healthRouter = new Router()
healthRouter.get('/health', ctx => {
  ctx.status = 200
  ctx.body = {status: 'ok'}
})
