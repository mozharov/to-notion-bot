import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Index,
} from 'typeorm'
import {Chat} from '../../chats/entities/chat.entity'

@Entity()
@Index(['telegramMessageId', 'chat'], {unique: true})
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Chat, {onDelete: 'CASCADE', nullable: false, eager: true})
  @JoinColumn()
  chat: Chat

  @Column({type: 'bigint'})
  telegramMessageId: number

  @Column({type: 'varchar'})
  notionPageId: string

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
