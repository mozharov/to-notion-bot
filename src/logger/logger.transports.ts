import * as winston from 'winston'

export const prettyConsole = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.prettyPrint(),
    winston.format.printf(({level, message, timestamp, context, ...meta}) => {
      let msg = `${timestamp} [${level.toUpperCase()}]`
      if (context) msg += ` [${context}]`
      msg += ': '
      msg += message.message || message
      if (Object.keys(meta).length) msg += `\n${JSON.stringify(meta, null, 2)}`
      return msg
    }),
  ),
})

export const jsonConsole = new winston.transports.Console({
  format: winston.format.combine(winston.format.json()),
})
