import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm'
import {Chat} from '../../../chats/entities/chat.entity'
import {NotionWorkspace} from '../../notion-workspaces/entities/notion-workspace.entity'

@Entity()
export class NotionDatabase {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => Chat, {onDelete: 'CASCADE', nullable: false})
  @JoinColumn()
  chat: Chat

  @ManyToOne(() => NotionWorkspace, {onDelete: 'CASCADE', nullable: false, eager: true})
  @JoinColumn()
  notionWorkspace: NotionWorkspace

  @Column({type: 'varchar'})
  databaseId: string

  @Column({type: 'varchar', nullable: true, default: null})
  title: string | null

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
