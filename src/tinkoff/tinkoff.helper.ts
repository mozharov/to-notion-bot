import {plainToClass} from 'class-transformer'
import {validate} from 'class-validator'
import {LoggerService} from '../logger/logger.service'
import {isPromise} from 'util/types'
import {InitOrderResponse} from './models/init-order-response.model'

const logger = new LoggerService('TinkoffHelper')

export async function validateInitOrderResponseData(data: unknown): Promise<InitOrderResponse> {
  let result = data
  if (isPromise(data)) {
    result = await data
  }
  const order = plainToClass(InitOrderResponse, result)
  const errors = await validate(order)
  if (errors.length) {
    logger.error('Validation failed', errors)
    throw new Error('Validation failed')
  }
  return order
}
