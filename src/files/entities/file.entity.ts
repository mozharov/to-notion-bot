import {Entity, PrimaryGeneratedColumn, CreateDateColumn, Column} from 'typeorm'
import {config} from '../../config/config.service'

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  fileId: string

  @Column({type: 'enum', enum: ['image', 'video', 'audio', 'file'], default: 'file'})
  type: 'image' | 'video' | 'audio' | 'file'

  @Column({type: 'varchar'})
  extension: string

  @CreateDateColumn({type: 'timestamp with time zone'})
  createdAt: Date

  public get url(): string {
    return `https://${config.get('ORIGIN_DOMAIN')}/file/${this.id}/${this.fileId}.${this.extension}`
  }
}
