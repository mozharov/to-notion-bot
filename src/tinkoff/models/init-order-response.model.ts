import {IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString} from 'class-validator'

export class InitOrderResponse {
  @IsString()
  @IsNotEmpty()
  TerminalKey: string

  @IsInt()
  Amount: number

  @IsString()
  @IsNotEmpty()
  OrderId: string

  @IsBoolean()
  Success: boolean

  @IsOptional()
  @IsString()
  Status?: string

  @IsString()
  @IsNotEmpty()
  PaymentId: string

  @IsString()
  @IsNotEmpty()
  ErrorCode: string

  @IsOptional()
  @IsString()
  PaymentURL?: string

  @IsOptional()
  @IsString()
  Message?: string

  @IsOptional()
  @IsString()
  Details?: string
}
