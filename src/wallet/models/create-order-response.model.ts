import {Type} from 'class-transformer'
import {IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested} from 'class-validator'

class Amount {
  @IsEnum(['TON', 'BTC', 'USDT', 'EUR', 'USD', 'RUB'])
  currencyCode: 'TON' | 'BTC' | 'USDT' | 'EUR' | 'USD' | 'RUB'

  @IsNotEmpty()
  @IsString()
  amount: string
}

class Data {
  @IsNotEmpty()
  @IsString()
  id: string

  @IsEnum(['ACTIVE', 'EXPIRED', 'PAID', 'CANCELED'])
  status: 'ACTIVE' | 'EXPIRED' | 'PAID' | 'CANCELED'

  @IsNotEmpty()
  @IsString()
  number: string

  @ValidateNested()
  @Type(() => Amount)
  amount: Amount

  @IsOptional()
  @IsEnum(['TON', 'BTC', 'USDT'])
  autoConversionCurrency?: 'TON' | 'BTC' | 'USDT'

  @IsString()
  createdDateTime: string

  @IsString()
  expirationDateTime: string

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  completedDateTime?: string

  @IsNotEmpty()
  @IsString()
  payLink: string

  @IsNotEmpty()
  @IsString()
  directPayLink: string
}

export class CreateOrderResponse {
  @IsEnum(['SUCCESS', 'ALREADY', 'CONFLICT', 'ACCESS_DENIED', 'INVALID_REQUEST', 'INTERNAL_ERROR'])
  status:
    | 'SUCCESS'
    | 'ALREADY'
    | 'CONFLICT'
    | 'ACCESS_DENIED'
    | 'INVALID_REQUEST'
    | 'INTERNAL_ERROR'

  @IsOptional()
  @IsString()
  message?: string

  @ValidateNested()
  @Type(() => Data)
  data: Data
}
