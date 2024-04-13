import {Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn} from 'typeorm'
import {User} from '../../users/entities/user.entity'
import {Promocode} from './promocode.entity'

@Entity()
export class PromocodeActivation {
  @PrimaryGeneratedColumn('uuid')
  id: number

  @ManyToOne(() => User, {nullable: false, onDelete: 'CASCADE'})
  @JoinColumn()
  user: User

  @ManyToOne(() => Promocode, {nullable: false, onDelete: 'CASCADE'})
  @JoinColumn()
  promocode: Promocode

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date
}
