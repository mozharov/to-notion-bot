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
  logger.debug({
    message: 'Parsed message',
    title,
    blocks,
  })

  const notionService = new NotionService(chat.notionWorkspace.secretToken)
  const messagesService = new MessagesService()

  const targetMessage = await shouldUpdateNotionPage(ctx.message, chat)
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

  await messagesService.create({
    telegramMessageId: ctx.message.message_id,
    notionPageId,
    chat,
  })
  const botMessageText = translate('new-message', chat.languageCode, {
    url: buildLinkToNotionPage(notionPageId),
    isUpdate: isUpdateMessage.toString(),
  })
  // TODO: в настройках чата можно включить опцию "показывать функции под сообщением после отправки в Notion, типа удалить, отменить изменения"
  // TODO: настройка тихого режима (в каналах включен по-умолчанию)
  const botMessage = await ctx.reply(botMessageText, {parse_mode: 'HTML'})
  await messagesService.create({
    telegramMessageId: botMessage.message_id,
    notionPageId,
    chat,
  })
}
