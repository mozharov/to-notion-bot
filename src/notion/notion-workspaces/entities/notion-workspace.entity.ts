import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import {User} from '../../../users/entities/user.entity'

@Entity()
export class NotionWorkspace {
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
  secretToken: string

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
