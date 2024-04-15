import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm'
import {User} from '../../users/entities/user.entity'
import {Plan} from '../../subscriptions/plans/entities/plan.entity'

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({type: 'integer'})
  amount: number

  @Column({type: 'enum', enum: ['RUB', 'USD']})
  currency: 'RUB' | 'USD'

  @Column({type: 'enum', enum: ['pending', 'completed', 'failed'], default: 'pending'})
  status: 'pending' | 'completed' | 'failed'

  @Column({type: 'enum', enum: ['card', 'wallet', 'crypto']})
  type: 'card' | 'wallet' | 'crypto'

  @Column({type: 'varchar', nullable: true, default: null})
  walletOrderNumber: string | null

  @Column({type: 'varchar', nullable: true, default: null})
  walletOrderId: string | null

  @ManyToOne(() => Plan, {onDelete: 'RESTRICT', nullable: false, eager: true})
  @JoinColumn()
  plan: Plan

  @ManyToOne(() => User, {onDelete: 'CASCADE', nullable: false, eager: true})
  @JoinColumn()
  user: User

  @Column({type: 'varchar', nullable: true, default: null})
  moyNalogReceiptId: string | null

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
