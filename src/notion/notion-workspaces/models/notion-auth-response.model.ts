import {Expose, Type} from 'class-transformer'
import {IsNotEmpty, IsOptional, IsString, ValidateNested} from 'class-validator'

class Owner {
  @Expose()
  @IsOptional()
  @IsString()
  id?: string

  @Expose()
  @IsOptional()
  @IsString()
  name?: string

  @Expose()
  @IsOptional()
  @IsString()
  avatar_url?: string
}

export class NotionAuthResponse {
  @Expose()
  @IsString()
  @IsNotEmpty()
  access_token: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  bot_id: string

  @Expose()
  @IsOptional()
  @IsString()
  duplicated_template_id?: string

  @Expose()
  @ValidateNested()
  @Type(() => Owner)
  owner: Owner

  @Expose()
  @IsOptional()
  @IsString()
  workspace_icon?: string

  @Expose()
  @IsString()
  @IsNotEmpty()
  workspace_id: string

  @Expose()
  @IsOptional()
  @IsString()
  workspace_name?: string
}
