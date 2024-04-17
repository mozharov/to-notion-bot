import {plainToClass} from 'class-transformer'
import {validate} from 'class-validator'
import {CreateOrderResponse} from './models/create-order-response.model'
import {LoggerService} from '../logger/logger.service'
import {isPromise} from 'util/types'

const logger = new LoggerService('WalletHelper')

export async function validateCreateOrderResponseData(data: unknown): Promise<CreateOrderResponse> {
  let result = data
  if (isPromise(data)) {
    result = await data
  }
  const order = plainToClass(CreateOrderResponse, result)
  const errors = await validate(order)
  if (errors.length) {
    logger.error('Validation failed', errors)
    throw new Error('Validation failed')
  }
  return order
}
