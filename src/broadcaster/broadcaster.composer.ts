import {Composer, InlineKeyboard} from 'grammy'
import {Context} from '../context'
import {isAdmin} from '../users/users.filters'
import {createConversation} from '@grammyjs/conversations'
import {broadcasting} from './broadcaster.conversations'
import {broadcasterService} from './broadcaster.service'
import {chatsService} from '../chats/chats.service'

export const broadcasterComposer = new Composer<Context>()
broadcasterComposer.use(createConversation(broadcasting))

const onlyAdmin = broadcasterComposer.chatType('private').filter(isAdmin)

onlyAdmin.command('broadcast').use(async ctx => {
  const keyboard = new InlineKeyboard()
    .add({
      callback_data: 'broadcast:ru',
      text: '🇷🇺 Русский',
    })
    .row()
    .add({
      callback_data: 'broadcast:en',
      text: '🇬🇧 English',
    })
    .row()
    .add({
      callback_data: 'broadcast:cancel',
      text: ctx.t('broadcast.cancel'),
    })
  await ctx.reply(ctx.t('broadcast'), {reply_markup: keyboard, parse_mode: 'HTML'})
})

onlyAdmin.callbackQuery(/^broadcast:(ru|en)$/).use(async ctx => {
  await ctx.conversation.enter('broadcasting', {overwrite: true})
})

onlyAdmin.callbackQuery('broadcast:cancel').use(async ctx => {
  await ctx.editMessageText(ctx.t('broadcast.cancelled'), {parse_mode: 'HTML'})
})

onlyAdmin.callbackQuery(/^broadcast:(ru|en):(\d+)$/).use(async ctx => {
  const languageCode = String(ctx.callbackQuery?.data?.split(':')[1])
  const messageId = Number(ctx.callbackQuery?.data?.split(':')[2])
  if (languageCode !== 'ru' && languageCode !== 'en') throw new Error('Invalid language code')

  await ctx.editMessageText(ctx.t('broadcast.sending'), {parse_mode: 'HTML'})

  const telegramUsersIds = await chatsService.getActivePrivateChatsIdsByLanguageCode(languageCode)
  // TODO: отдельный микро-сервис для рассылки
  await broadcasterService.createBroadcasting(telegramUsersIds, messageId, ctx.from.id)
})

onlyAdmin.command('broadcast_status').use(async ctx => {
  const count = await broadcasterService.countAll()
  await ctx.reply(ctx.t('broadcast.status', {count}), {parse_mode: 'HTML'})
})
