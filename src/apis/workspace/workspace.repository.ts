import { Workspace } from '../../entities/workspace.entity';
import AppDataSource from '@/config/typeorm.config'

export class WorkspaceRepository {
    private repo = AppDataSource.getRepository(Workspace)

    async findAll(): Promise<Workspace[]> {
        return this.repo.find()
    }

    async findById(id: string): Promise<Workspace | null> {
        return this.repo.findOne({ where: { id } })
    }

    async createWorkspace(data: Partial<Workspace>): Promise<Workspace> {
        const workspace = this.repo.create(data)
        return this.repo.save(workspace)
    }

    async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace | null> {
        await this.repo.update(id, data)
        return this.findById(id)
    }

    async deleteWorkspace(id: string): Promise<void> {
        await this.repo.delete(id)
    }
    
    async findWorkspaceBy(query: Partial<Workspace>) {
        return this.repo.findOneBy(query)
    }
}
