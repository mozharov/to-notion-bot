import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  BaseEntity,
  UpdateDateColumn,
  Column,
  OneToOne,
} from 'typeorm'
import {User} from '../../users/entities/user.entity'

@Entity()
export class Referral extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({type: 'varchar', nullable: true, default: null})
  referrerCode: string | null

  @OneToOne(() => User, {onDelete: 'CASCADE', nullable: false, eager: true})
  @JoinColumn()
  owner: User

  @Column({unique: true})
  code: string

  @Column({type: 'int', default: 0})
  launchesCount: number

  @Column({type: 'int', default: 0})
  monthsCount: number

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
