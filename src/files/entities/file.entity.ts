import {Entity, PrimaryGeneratedColumn, CreateDateColumn, Column} from 'typeorm'
import {ConfigService} from '../../config/config.service'

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
    return `${ConfigService.filePath}${this.id}/${this.fileId}.${this.extension}`
  }
}
