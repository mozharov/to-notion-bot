import {Composer} from 'grammy'
import {Context} from '../context'
import {notifyUser} from './messages.actions'
import {
  getTelegramFile,
  getPrevMessage,
  getSenderId,
  getSentAt,
  getFileType,
  getLinkToOriginal,
} from './messages.helper'
import {LoggerService} from '../logger/logger.service'
import {messagesService} from './messages.service'
import {onlyActiveChat, checkMentionMode} from './messages.middlewares'
import {NotionService} from '../notion/notion.service'
import {chatsService} from '../chats/chats.service'
import {
  convertFileToNotionBlock,
  convertMessageToNotionBlocks,
  hasInnerContent,
  truncateTextForTitle,
} from '../notion/notion.helper'
import {filesService} from '../files/files.service'
import {checkSubscription} from '../subscriptions/subscriptions.middleware'

const logger = new LoggerService('MessagesComposer')

export const messageComposer = new Composer<Context>()

const messageContent = messageComposer.on([
  'message:text',
  'channel_post:text',
  'channel_post:caption',
  'message:caption',
  'message:file',
  'channel_post:file',
])

messageContent.chatType(['group', 'supergroup']).use(checkMentionMode)

messageContent
  .use(onlyActiveChat)
  .use(checkSubscription)
  .use(async ctx => {
    logger.debug('Message received')
    await ctx.replyWithChatAction('typing')
    const senderId = getSenderId(ctx)
    const sentAt = getSentAt(ctx)
    const chat = await chatsService.getActiveChatByTelegramId(ctx.chat.id)
    const message = ctx.message ?? ctx.channelPost
    const prevMessage = await getPrevMessage(message, chat)
    const isUpdate = !!prevMessage
    const silentMode = (!message.reply_to_message && isUpdate) || chat.silentMode
    if (!silentMode) await ctx.replyWithChatAction('typing')

    const text = message.text ?? message.caption
    const title = truncateTextForTitle(text ?? ctx.t('new-file'))
    const blocks =
      text && (hasInnerContent(text, message.entities) || !!prevMessage)
        ? convertMessageToNotionBlocks(text, message.entities)
        : []

    const tgFile = await getTelegramFile(ctx)
    if (tgFile) {
      const fileType = getFileType(message)
      const file = await filesService.saveFile(tgFile, fileType)
      const fileBlock = convertFileToNotionBlock(file)
      blocks.push(fileBlock)
    }

    const linkToOriginal = getLinkToOriginal(message)
    if (linkToOriginal) {
      blocks.push({
        object: 'block',
        paragraph: {
          rich_text: [
            {
              text: {content: ctx.t('link-to-original'), link: {url: linkToOriginal}},
              annotations: {italic: true},
            },
          ],
        },
      })
    }

    const notionService = new NotionService(chat.notionWorkspace.accessToken)
    const notionPageId = await notionService.saveToNotion(
      {
        ...(prevMessage
          ? {pageId: prevMessage.notionPageId}
          : {databaseId: chat.notionDatabase.databaseId}),
      },
      title,
      blocks,
    )
    await messagesService.saveMessage({
      telegramMessageId: message.message_id,
      notionPageId,
      chat,
      senderId,
      sentAt,
    })

    return notifyUser(ctx, message.message_id, chat, isUpdate, silentMode, notionPageId)
  })
