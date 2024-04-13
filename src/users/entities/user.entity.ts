import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({unique: true, type: 'bigint'})
  telegramId: number

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
