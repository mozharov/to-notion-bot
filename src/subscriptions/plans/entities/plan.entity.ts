import {Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn} from 'typeorm'

@Entity()
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({default: true})
  isActive: boolean

  @Column({type: 'int'})
  price: number // in cents

  @Column({type: 'int'})
  durationInDays: number // 1 month = 30 days

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date

  public get months(): number {
    return this.durationInDays / 30
  }

  public get dollars(): number {
    return this.price / 100
  }
}
