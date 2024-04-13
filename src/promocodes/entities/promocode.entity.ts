import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export const MAX_LENGTH_CODE = 100

@Entity()
export class Promocode extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'varchar',
    unique: true,
    length: MAX_LENGTH_CODE,
  })
  code: string

  @Column({type: 'int'})
  freeDays: number

  @Column({type: 'int', default: 0})
  used: number

  @Column({type: 'int', default: 0})
  maxUses: number // 0 = unlimited

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
