import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  BaseEntity,
} from 'typeorm'
import {User} from '../../../users/entities/user.entity'

@Entity()
@Index(['workspaceId', 'owner'], {unique: true})
export class NotionWorkspace extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, {onDelete: 'CASCADE', nullable: false, eager: true})
  @JoinColumn()
  owner: User

  @Column({enum: ['active', 'inactive'], default: 'active', type: 'enum'})
  status: 'active' | 'inactive'

  @Column({type: 'varchar'})
  name: string

  @Column({type: 'varchar'})
  accessToken: string

  @Column({type: 'varchar'})
  workspaceId: string

  @Column({type: 'varchar'})
  botId: string

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
