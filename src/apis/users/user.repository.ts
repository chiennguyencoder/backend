import { User } from '@/entities/user.entity'
import AppDataSource from '@/config/typeorm.config'
import { Role } from '@/entities/role.entity'

class UserRepository {
    private repo = AppDataSource.getRepository(User)

    async findAll(): Promise<User[]> {
        return this.repo.find()
    }

    async findById(id: string): Promise<User | null> {
        return this.repo.findOne({ where: { id }, relations: ['role'] })
    }

    async createUser(data: Partial<User>): Promise<User> {
        const roleRepo = AppDataSource.getRepository(Role)

        const defaultRole = await roleRepo.findOneBy({ name: 'user' })
        if (!defaultRole) {
            throw new Error('Default role not found')
        }
        const user = this.repo.create({
            ...data,
            role: [defaultRole]
        })
        return this.repo.save(user)
    }

    async updateUser(id: string, data: Partial<User>): Promise<User | null> {
        await this.repo.update(id, data)
        return this.findById(id)
    }

    async deleteUser(id: string): Promise<void> {
        await this.repo.delete(id)
    }
    async findByEmailAsync(email: string | undefined): Promise<User | null> {
        return this.repo.findOneBy({ email })
    }
    // file by object
    async findUserBy(query: Partial<User>) {
        return this.repo.findOne({ where: query, relations: ['role'] })
    }
}

export default new UserRepository()
