import {Bot, Composer} from 'grammy'
import {config} from './config/config.service'
import {Context} from './context'
import {startComposer} from './start/start.composer'
import {i18nComposer} from './i18n/i18n.composer'
import {errorsHandler} from './errors/errors.handler'
import {sessionComposer} from './session/session.composer'
import {conversationComposer} from './conversation/conversation.composer'
import {chatsComposer} from './chats/chats.composer'
import {notionWorkspacesComposer} from './notion/notion-workspaces/notion-workspaces.composer'
import {messageComposer} from './messages/messages.composer'
import {helpComposer} from './help/help.composer'
import {subscriptionsComposer} from './subscriptions/subscriptions.composer'
import {autoRetry} from '@grammyjs/auto-retry'
import {broadcasterComposer} from './broadcaster/broadcaster.composer'
import {plansComposer} from './subscriptions/plans/plans.composer'
import {referralComposer} from './referral/referral.composer'
import {promocodesComposer} from './promocodes/promocodes.composer'
import {UserFromGetMe} from 'grammy/types'

export const botInfo: UserFromGetMe = {
  id: config.get('BOT_ID'),
  first_name: config.get('BOT_FIRST_NAME'),
  username: config.get('BOT_USERNAME'),
  is_bot: true,
  can_join_groups: true,
  can_read_all_group_messages: true,
  supports_inline_queries: false,
}

export const bot = new Bot<Context>(config.get('BOT_TOKEN'), {botInfo})
bot.api.config.use(autoRetry({retryOnInternalServerErrors: true}))

const composer = new Composer<Context>()

composer.use(sessionComposer)
composer.use(i18nComposer)
composer.use(conversationComposer)

composer.use(startComposer)
composer.use(helpComposer)

composer.use(subscriptionsComposer)
composer.use(referralComposer)

composer.use(chatsComposer)
composer.use(notionWorkspacesComposer)
composer.use(broadcasterComposer)
composer.use(plansComposer)
composer.use(promocodesComposer)

composer.use(messageComposer)

composer.chatType('private').on('callback_query', async ctx => {
  await ctx.answerCallbackQuery({text: ctx.t('unknown-callback-query')})
  return ctx.deleteMessage().catch(() => true)
})

bot.errorBoundary(errorsHandler).use(composer)
