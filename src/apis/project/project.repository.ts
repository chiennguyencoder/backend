import { Project } from './../../entities/project.entity';
import AppDataSource from '@/config/typeorm.config'

export class ProjectRepository {
    private repo = AppDataSource.getRepository(Project)

    async findAll(): Promise<Project[]> {
        return this.repo.find()
    }

    async findById(id: string): Promise<Project | null> {
        return this.repo.findOne({ where: { id } })
    }

    async createProject(data: Partial<Project>): Promise<Project> {
        const Project = this.repo.create(data)
        return this.repo.save(Project)
    }

    async updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
        await this.repo.update(id, data)
        return this.findById(id)
    }

    async deleteProject(id: string): Promise<void> {
        await this.repo.delete(id)
    }
    
    async findProjectBy(query: Partial<Project>) {
        return this.repo.findOneBy(query)
    }
}
