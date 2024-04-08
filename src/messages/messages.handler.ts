import {Context} from '../context'
import {LoggerService} from '../logger/logger.service'
import {getBlocksFromMessage, getTitleFromMessageText} from '../notion/notion.helper'
import {ChatsService} from '../chats/chats.service'
import {NotionService} from '../notion/notion.service'
import {MessagesService} from './messages.service'
import {translate} from '../i18n/i18n.helper'
import {buildLinkToNotionPage, shouldUpdateNotionPage} from './messages.helper'

const logger = new LoggerService('ContentHandler')

export async function sendTextMessageToNotion(ctx: Context): Promise<void> {
  if (!ctx.chat || !ctx.message?.text) throw new Error('No chat or message text in context')

  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(ctx.chat.id)
  if (!chat || !chat.isActive()) {
    logger.debug('Chat is not active')
    return
  }

  const messageText = ctx.message.text
  const messageEntities = ctx.message.entities
  const title = getTitleFromMessageText(messageText)
  const blocks = getBlocksFromMessage(messageText, messageEntities)

  const notionService = new NotionService(chat.notionWorkspace.secretToken)
  const targetMessage = await shouldUpdateNotionPage(ctx.message, chat)
  const silentUpdate = !ctx.message.reply_to_message && targetMessage
  let isUpdateMessage = false
  let notionPageId: string
  if (targetMessage) {
    notionPageId = targetMessage.notionPageId
    isUpdateMessage = true
    await notionService.appendBlockToPage(notionPageId, title, blocks)
  } else {
    const createPageResponse = await notionService.createPage(
      chat.notionDatabase.databaseId,
      title,
      blocks,
    )
    notionPageId = createPageResponse.id
  }

  const senderId = ctx.message.from.id
  const sentAt = ctx.message.date
  const messagesService = new MessagesService()
  await messagesService.create({
    telegramMessageId: ctx.message.message_id,
    notionPageId,
    chat,
    senderId,
    sentAt,
  })
  if (silentUpdate) {
    await ctx.react('⚡').catch(error => logger.error(error))
    return
  }
  const botMessageText = translate('new-message', chat.languageCode, {
    url: buildLinkToNotionPage(notionPageId),
    isUpdate: isUpdateMessage.toString(),
  })
  const botMessage = await ctx.reply(botMessageText, {
    parse_mode: 'HTML',
    reply_parameters: {
      allow_sending_without_reply: true,
      message_id: ctx.message.message_id,
    },
  })
  await messagesService.create({
    telegramMessageId: botMessage.message_id,
    notionPageId,
    chat,
    senderId: ctx.me.id,
    sentAt: botMessage.date,
  })
}
