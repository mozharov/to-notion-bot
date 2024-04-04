import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm'
import {User} from '../../users/entities/user.entity'
import {NotionWorkspace} from '../../notion/notion-workspaces/entities/notion-workspace.entity'
import {NotionDatabase} from '../../notion/notion-databases/entities/notion-database.entity'

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({unique: true, type: 'bigint'})
  telegramId: number

  @Column({type: 'varchar', nullable: true, default: null})
  title: string | null

  @Column({type: 'enum', enum: ['private', 'group', 'channel']})
  type: 'private' | 'group' | 'channel'

  @Column({type: 'enum', enum: ['unblocked', 'blocked'], default: 'unblocked'})
  botStatus: 'unblocked' | 'blocked'

  @Column({type: 'enum', enum: ['active', 'inactive'], default: 'inactive'})
  status: 'active' | 'inactive'

  @ManyToOne(() => User, {onDelete: 'CASCADE', nullable: false, eager: true})
  @JoinColumn()
  owner: User

  @ManyToOne(() => NotionDatabase, {onDelete: 'SET NULL', nullable: true, eager: true})
  @JoinColumn()
  notionDatabase: NotionDatabase | null

  @ManyToOne(() => NotionWorkspace, {onDelete: 'SET NULL', nullable: true, eager: true})
  @JoinColumn()
  notionWorkspace: NotionWorkspace | null

  @Column({type: 'enum', enum: ['en', 'ru'], default: 'en'})
  languageCode: 'en' | 'ru'

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
