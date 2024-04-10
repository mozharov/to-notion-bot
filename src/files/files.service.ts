import {FindOptionsWhere, Repository} from 'typeorm'
import {DataSource} from '../typeorm/typeorm.data-source'
import {File} from './entities/file.entity'
import {File as GrammyFile} from 'grammy/types'

class FilesService {
  private readonly repository: Repository<File>

  constructor() {
    this.repository = DataSource.getRepository(File)
  }

  public saveFile(file: GrammyFile, type: File['type']): Promise<File> {
    const item = new File()
    item.fileId = file.file_id
    item.type = type
    item.extension = file.file_path?.split('.').pop() ?? 'unknown'
    return this.repository.save(item)
  }

  public findFile(data: FindOptionsWhere<File>): Promise<File | null> {
    return this.repository.findOneBy(data)
  }
}

export const filesService = new FilesService()
