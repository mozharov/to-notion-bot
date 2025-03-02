import {config} from '../../../config.js'
import type {File} from '../../../models/files.js'

export function getFileUrl(file: File) {
  return `http${config.NODE_ENV === 'development' ? '' : 's'}://${config.HOST}/file/${file.id}/${file.fileId}.${file.extension}`
}
