import {config} from '../../../config.js'
import type {File} from '../../../models/files.js'

export function getFileUrl(file: File) {
  return `${config.origin}/file/${file.id}/${file.fileId}.${file.extension}`
}
