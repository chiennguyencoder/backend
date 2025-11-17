import AppDataSource from '@/config/typeorm.config'
import { Project } from '@/entities/project.entity'
import { User } from '@/entities/user.entity'

export class WorkspaceRepository {
  private repo = AppDataSource.getRepository(Project)

  // Tìm workspace bằng ID và ownerId (để check quyền)
  async findByIdAndOwner(id: string, ownerId: string) {
    return this.repo.findOne({
      where: { id, owner: { id: ownerId } },
    })
  }
  
  // Tìm workspace bằng ID
  async findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  // Tạo workspace mới
  async create(data: Partial<Project>, owner: User): Promise<Project> {
    const workspace = this.repo.create({
      ...data,
      owner: owner,
    })
    return this.repo.save(workspace)
  }

  // Cập nhật (dùng cho archive/reopen)
  async update(id: string, data: Partial<Project>): Promise<Project | null> {
    await this.repo.update(id, data)
    return this.findById(id);
  }
}