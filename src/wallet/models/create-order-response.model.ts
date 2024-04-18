import {Expose, Type} from 'class-transformer'
import {IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested} from 'class-validator'

class Amount {
  @Expose()
  @IsEnum(['TON', 'BTC', 'USDT', 'EUR', 'USD', 'RUB'])
  currencyCode: 'TON' | 'BTC' | 'USDT' | 'EUR' | 'USD' | 'RUB'

  @Expose()
  @IsNotEmpty()
  @IsString()
  amount: string
}

class Data {
  @Expose()
  @IsNotEmpty()
  @IsString()
  id: string

  @Expose()
  @IsEnum(['ACTIVE', 'EXPIRED', 'PAID', 'CANCELED'])
  status: 'ACTIVE' | 'EXPIRED' | 'PAID' | 'CANCELED'

  @Expose()
  @IsNotEmpty()
  @IsString()
  number: string

  @Expose()
  @ValidateNested()
  @Type(() => Amount)
  amount: Amount

  @Expose()
  @IsOptional()
  @IsEnum(['TON', 'BTC', 'USDT'])
  autoConversionCurrency?: 'TON' | 'BTC' | 'USDT'

  @Expose()
  @IsString()
  createdDateTime: string

  @Expose()
  @IsString()
  expirationDateTime: string

  @Expose()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  completedDateTime?: string

  @Expose()
  @IsNotEmpty()
  @IsString()
  payLink: string

  @Expose()
  @IsNotEmpty()
  @IsString()
  directPayLink: string
}

export class CreateOrderResponse {
  @Expose()
  @IsEnum(['SUCCESS', 'ALREADY', 'CONFLICT', 'ACCESS_DENIED', 'INVALID_REQUEST', 'INTERNAL_ERROR'])
  status:
    | 'SUCCESS'
    | 'ALREADY'
    | 'CONFLICT'
    | 'ACCESS_DENIED'
    | 'INVALID_REQUEST'
    | 'INTERNAL_ERROR'

  @Expose()
  @IsOptional()
  @IsString()
  message?: string

  @Expose()
  @ValidateNested()
  @Type(() => Data)
  data: Data
}
