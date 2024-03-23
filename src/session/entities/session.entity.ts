import {Entity, CreateDateColumn, UpdateDateColumn, PrimaryColumn, Column} from 'typeorm'
import {SessionData} from '../session.context'

@Entity()
export class Session {
  @PrimaryColumn()
  id: string

  @Column('jsonb', {nullable: true, default: null})
  data: SessionData | null

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  @UpdateDateColumn({type: 'timestamp with time zone'})
  updatedAt: Date
}
