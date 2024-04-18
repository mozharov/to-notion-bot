import {ClassConstructor, plainToClass} from 'class-transformer'
import {validate} from 'class-validator'

class UtilsService {
  public async transformData<T, V>(plain: V, dataClass: ClassConstructor<T>): Promise<T> {
    if (!plain) throw new Error('No data')
    const body: unknown = typeof plain === 'string' ? JSON.parse(plain) : plain
    const data = plainToClass(dataClass, body, {
      enableCircularCheck: false,
      enableImplicitConversion: true,
      excludeExtraneousValues: false,
      exposeDefaultValues: false,
      exposeUnsetFields: false,
      strategy: 'excludeAll',
    })
    if (!data) throw new Error('No data')
    const errors = await validate(data)
    if (errors.length) throw {errors, plain}
    return data
  }
}

export const utils = new UtilsService()
