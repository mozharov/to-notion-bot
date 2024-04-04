import {Repository} from 'typeorm'
import {NotionWorkspace} from './entities/notion-workspace.entity'
import {DataSource} from '../../typeorm/typeorm.data-source'
import {User} from '../../users/entities/user.entity'

export class NotionWorkspacesService {
  private readonly repository: Repository<NotionWorkspace>

  constructor() {
    this.repository = DataSource.getRepository(NotionWorkspace)
  }

  public async getWorkspacesByOwner(owner: User): Promise<NotionWorkspace[]> {
    return this.repository.findBy({owner: {id: owner.id}})
  }

  public async getWorkspaceById(id: string): Promise<NotionWorkspace | null> {
    return this.repository.findOneBy({id})
  }

  public async deleteWorkspace(workspace: NotionWorkspace): Promise<void> {
    await this.repository.remove(workspace)
  }

  public async updateWorkspace(
    data: Partial<NotionWorkspace> & {id: NotionWorkspace['id']},
  ): Promise<NotionWorkspace> {
    const workspace = await this.repository.findOneOrFail({
      where: {id: data.id},
    })
    Object.assign(workspace, data)
    return this.repository.save(workspace)
  }
}
