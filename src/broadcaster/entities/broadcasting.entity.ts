import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, BaseEntity} from 'typeorm'

@Entity()
export class Broadcasting extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({type: 'bigint'})
  telegramMessageId: number

  @Column({type: 'bigint'})
  telegramSenderId: number

  @Column({type: 'bigint'})
  telegramUserId: number

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date
}
