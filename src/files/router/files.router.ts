import {Router} from 'express'
import {LoggerService} from '../../logger/logger.service'
import {filesService} from '../files.service'
import superagent from 'superagent'
import {bot} from '../../bot'
import {config} from '../../config/config.service'
import {PassThrough} from 'stream'

const logger = new LoggerService('FilesRouter')

export const filesRouter = Router()

filesRouter.route('/file/:id/:fileId.:extension').get(async (req, res) => {
  const {id, fileId, extension} = req.params
  logger.debug('File requested')
  const check = /^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/
  if (!check.test(id)) {
    logger.debug('Invalid file id')
    return res.status(400).send('Invalid id')
  }

  const file = await filesService.findFile({id, fileId, extension})
  if (!file) {
    logger.debug('File not found')
    return res.status(404).send('File not found')
  }
  const tgFile = await bot.api.getFile(file.fileId)
  logger.debug('File found', tgFile)
  const fileUrl = `https://api.telegram.org/file/bot${config.get('BOT_TOKEN')}/${tgFile.file_path}`

  try {
    const passThrough = new PassThrough()
    superagent
      .get(fileUrl)
      .on('error', err => {
        logger.error('Error during file streaming:', err)
        res.status(500).send('Error fetching file')
      })
      .pipe(passThrough)
    res.setHeader('Transfer-Encoding', 'chunked')
    passThrough.pipe(res)
  } catch (error) {
    logger.error('Error fetching file:', error)
    res.status(500).send('Error fetching file')
  }
  return
})
