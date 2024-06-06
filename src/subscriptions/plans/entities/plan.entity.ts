import {
  Entity,
  CreateDateColumn,
  Column,
  UpdateDateColumn,
  BaseEntity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class Plan extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({type: 'enum', enum: ['month', 'year'], unique: true})
  name: 'month' | 'year'

  @Column({type: 'int', default: 5000})
  amount: number

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
