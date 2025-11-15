import { User } from '@/entities/user.entity'
import AppDataSource from '@/config/typeorm.config'

class UserRepository {
    private repo = AppDataSource.getRepository(User)

    async findAll(): Promise<User[]> {
        return this.repo.find()
    }

    async findById(id: string): Promise<User | null> {
        return this.repo.findOne({ where: { id } })
    }

    async createUser(data: Partial<User>): Promise<User> {
        const user = this.repo.create(data)
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
        return this.repo.findOneBy(query)
    }
}

export default new UserRepository()
