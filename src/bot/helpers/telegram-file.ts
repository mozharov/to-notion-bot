import type {Context} from 'grammy'
import {TooBigFileError} from '../errors/too-big-file-error.js'
import type {Message} from 'grammy/types'
import type {File} from '../../models/files.js'

export async function getTelegramFile(ctx: Context) {
  const message = ctx.message ?? ctx.channelPost
  if (
    !message ||
    (!message.audio &&
      !message.video &&
      !message.photo &&
      !message.document &&
      !message.voice &&
      !message.video_note)
  ) {
    return null
  }
  try {
    return await ctx.getFile()
  } catch (error) {
    if (error && typeof error === 'object' && 'error_code' in error && error.error_code === 400) {
      ctx.log.warn('File is too big')
      throw new TooBigFileError()
    }
    ctx.log.error({error}, 'Error while getting file')
    throw error
  }
}

export function getFileType(message: Message): File['type'] {
  if (message.audio || message.voice) return 'audio'
  if (message.video || message.video_note) return 'video'
  if (message.photo) return 'image'
  return 'file'
}
