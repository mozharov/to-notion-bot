import {Context} from '../context'
import {LoggerService} from '../logger/logger.service'
import {messagesService} from './messages.service'
import {translate} from '../i18n/i18n.helper'
import {Chat} from '../chats/entities/chat.entity'
import {buildLinkToNotionPage} from '../notion/notion.helper'

const logger = new LoggerService('ContentHandler')

export async function notifyUser(
  ctx: Context,
  replyToMessageId: number,
  chat: Chat,
  isUpdate: boolean,
  silentMode: boolean,
  notionPageId: string,
): Promise<void> {
  if (silentMode) {
    await ctx.react('⚡').catch(error => logger.error(error))
    return
  }

  const botMessageText = translate('new-message', chat.languageCode, {
    url: buildLinkToNotionPage(notionPageId),
    isUpdate: isUpdate.toString(),
  })
  const botMessage = await ctx.reply(botMessageText, {
    parse_mode: 'HTML',
    reply_parameters: {
      allow_sending_without_reply: true,
      message_id: replyToMessageId,
    },
  })
  await messagesService.saveMessage({
    telegramMessageId: botMessage.message_id,
    notionPageId,
    chat,
    senderId: ctx.me.id,
    sentAt: botMessage.date,
  })
}
