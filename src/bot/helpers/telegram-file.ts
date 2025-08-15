import type {Context} from 'grammy'
import {TooBigFileError} from '../errors/too-big-file-error.js'
import type {Message} from 'grammy/types'
import type {File} from '../../models/files.js'

export async function getTelegramFile(ctx: Context, specificMessage?: Message) {
  const message = specificMessage || ctx.message || ctx.channelPost
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
    // If a specific message is provided, we need to get the file directly
    if (specificMessage) {
      // For photos, we need to get the largest one
      if (specificMessage.photo && specificMessage.photo.length > 0) {
        const largestPhoto = specificMessage.photo.sort((a, b) => {
          const sizeA = a.file_size ?? 0
          const sizeB = b.file_size ?? 0
          return sizeB - sizeA
        })[0]
        if (largestPhoto?.file_id) {
          return await ctx.api.getFile(largestPhoto.file_id)
        }
      }

      // For other media types, get the file_id from the appropriate field
      const fileId =
        specificMessage.document?.file_id ||
        specificMessage.audio?.file_id ||
        specificMessage.video?.file_id ||
        specificMessage.voice?.file_id ||
        specificMessage.video_note?.file_id

      if (fileId) {
        return await ctx.api.getFile(fileId)
      }

      return null
    }

    // For the current message, use the built-in getFile method
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
