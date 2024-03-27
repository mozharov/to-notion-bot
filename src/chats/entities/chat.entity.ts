import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import {User} from '../../users/entities/user.entity'

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({unique: true, type: 'bigint'})
  telegramId: number

  @Column({type: 'varchar', nullable: true, default: null})
  title: string | null

  @Column({enum: ['unblocked', 'blocked'], default: 'unblocked'})
  botStatus: 'unblocked' | 'blocked'

  @Column({enum: ['active', 'inactive'], default: 'inactive'})
  status: 'active' | 'inactive'

  @ManyToOne(() => User, {onDelete: 'CASCADE', nullable: false, eager: true})
  @JoinColumn()
  owner: User

  @Column({type: 'enum', enum: ['en', 'ru'], nullable: true, default: null})
  languageCode: 'en' | 'ru' | null

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
