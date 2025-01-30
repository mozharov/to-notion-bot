import type {ChatTypeContext, Context, Middleware} from 'grammy'
import {getSenderId} from '../helpers/sender-id.js'
import {getSentAt} from '../helpers/sent-at.js'
import {getChatByTelegramId, type Chat} from '../../models/chats.js'
import {getPrevMessage} from '../helpers/prev-message.js'
import {
  convertFileToNotionBlock,
  convertMessageToNotionBlocks,
  truncateTextForTitle,
} from '../helpers/notion-block.js'
import {hasInnerContent} from '../helpers/notion-block.js'
import {getFileType, getTelegramFile} from '../helpers/telegram-file.js'
import {createFile} from '../../models/files.js'
import {getLinkToOriginal} from '../helpers/link-to-original.js'
import {NotionClient} from '../../lib/notion-client.js'
import {NotFoundDatabaseError} from '../errors/not-found-database-error.js'
import {createMessage} from '../../models/messages.js'
import {translate} from '../lib/i18n.js'
import {buildLinkToNotionPage} from '../helpers/link-to-notion-page.js'

export const messageHandler: Middleware<
  ChatTypeContext<Context, 'channel' | 'group' | 'supergroup' | 'private'>
> = async ctx => {
  const senderId = getSenderId(ctx)
  const sentAt = getSentAt(ctx)
  const chat = await getChatByTelegramId(ctx.chat.id)
  if (chat?.status !== 'active' || !chat.notionWorkspaceId || !chat.notionDatabaseId) {
    throw new Error('Chat is not active')
  }
  const message = ctx.message ?? ctx.channelPost
  if (!message) throw new Error('Message is not found')
  const prevMessage = await getPrevMessage(message, chat)
  const isUpdate = !!prevMessage
  const silentMode = (!message.reply_to_message && isUpdate) || chat.silentMode

  if (silentMode) await ctx.replyWithChatAction('upload_document')
  else await ctx.replyWithChatAction('typing')

  const text = message.text ?? message.caption
  const title = truncateTextForTitle(text ?? ctx.t('new-file'))
  const entities = message.entities ?? message.caption_entities
  const blocks =
    text && (hasInnerContent(text, entities) || !!prevMessage)
      ? convertMessageToNotionBlocks(text, entities)
      : []

  const tgFile = await getTelegramFile(ctx)
  if (tgFile) {
    const fileType = getFileType(message)
    const file = await createFile(tgFile, fileType)
    const fileBlock = convertFileToNotionBlock(file)
    blocks.push(fileBlock)
  }

  ctx.tracker.capture('message', {
    chat: chat.id,
    file: !!tgFile,
    fileSize: tgFile?.file_size,
    textLength: text?.length,
    forwardMessage: !!message.forward_origin,
    updateNotionPage: !!prevMessage,
  })

  const linkToOriginal = getLinkToOriginal(message)
  if (linkToOriginal) {
    blocks.push({
      object: 'block',
      paragraph: {
        rich_text: [
          {
            text: {content: ctx.t('link-to-author'), link: {url: linkToOriginal}},
            annotations: {italic: true},
          },
        ],
      },
    })
  }

  if (!chat.notionWorkspace) throw new Error('Notion workspace is not set')
  if (!chat.notionDatabase) throw new Error('Notion database is not set')

  const notionService = new NotionClient(chat.notionWorkspace.accessToken)
  const notionPageId = await notionService
    .saveToNotion(
      {
        ...(prevMessage
          ? {pageId: prevMessage.notionPageId}
          : {databaseId: chat.notionDatabase.databaseId}),
      },
      title,
      blocks,
    )
    .catch((error: unknown) => {
      if (error instanceof Error && 'status' in error && error.status === 404) {
        throw new NotFoundDatabaseError()
      }
      throw error
    })
  await createMessage({
    telegramMessageId: message.message_id,
    notionPageId,
    chatId: chat.id,
    senderId,
    sentAt,
  })
  return notifyUser(ctx, message.message_id, chat, isUpdate, silentMode, notionPageId)
}

async function notifyUser(
  ctx: Context,
  replyToMessageId: number,
  chat: Chat,
  isUpdate: boolean,
  silentMode: boolean,
  notionPageId: string,
): Promise<void> {
  if (silentMode) {
    await ctx.react('⚡').catch(() => null)
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
  await createMessage({
    telegramMessageId: botMessage.message_id,
    notionPageId,
    chatId: chat.id,
    senderId: ctx.me.id,
    sentAt: botMessage.date,
  })
}
