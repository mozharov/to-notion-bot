import {Context} from '../context'
import {LoggerService} from '../logger/logger.service'
import {getBlocksFromMessage, getTitleFromMessageText} from '../notion/notion.helper'
import {ChatsService} from '../chats/chats.service'
import {NotionService} from '../notion/notion.service'
import {MessagesService} from './messages.service'
import {translate} from '../i18n/i18n.helper'
import {buildLinkToNotionPage, shouldUpdateNotionPage} from './messages.helper'
import {MessageData} from './messages.composer'

const logger = new LoggerService('ContentHandler')

export async function sendTextMessageToNotion(ctx: Context, message: MessageData): Promise<void> {
  const chatsService = new ChatsService()
  const chat = await chatsService.getChatByTelegramId(message.chat.id)
  if (!chat || !chat.isActive()) {
    logger.debug('Chat is not active')
    return
  }

  const title = getTitleFromMessageText(message.text)
  const blocks = getBlocksFromMessage(message.text, message.entities)

  const targetMessage = await shouldUpdateNotionPage(message, chat)
  const silentUpdate = (!message.replyToMessage && targetMessage) || message.isChannel

  const notionService = new NotionService(chat.notionWorkspace.secretToken)
  let notionPageId: string
  if (targetMessage) {
    notionPageId = targetMessage.notionPageId
    await notionService.appendBlockToPage(notionPageId, title, blocks)
  } else {
    const createPageResponse = await notionService.createPage(
      chat.notionDatabase.databaseId,
      title,
      blocks,
    )
    notionPageId = createPageResponse.id
  }

  const messagesService = new MessagesService()
  await messagesService.create({
    telegramMessageId: message.id,
    notionPageId,
    chat,
    senderId: message.from,
    sentAt: message.time,
  })

  if (silentUpdate) {
    await ctx.react('⚡').catch(error => logger.error(error))
    return
  }

  const botMessageText = translate('new-message', chat.languageCode, {
    url: buildLinkToNotionPage(notionPageId),
    isUpdate: (!!targetMessage).toString(),
  })
  const botMessage = await ctx.reply(botMessageText, {
    parse_mode: 'HTML',
    reply_parameters: {
      allow_sending_without_reply: true,
      message_id: message.id,
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
