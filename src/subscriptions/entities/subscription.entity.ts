import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from 'typeorm'
import {User} from '../../users/entities/user.entity'

@Entity()
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, {onDelete: 'CASCADE', nullable: false, eager: true})
  @JoinColumn()
  user: User

  @Column({default: true})
  isActive: boolean

  @Column({type: 'timestamp with time zone'})
  endsAt: Date

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  public get daysLeft(): number {
    const diffTime = Math.abs(this.endsAt.getTime() - new Date().getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
}
