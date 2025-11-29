import { Board } from '@/entities/board.entity'
import AppDataSource from '@/config/typeorm.config'
import { Role } from '@/entities/role.entity'
import { User } from '@/entities/user.entity'
import { BoardMembers } from '@/entities/board-member.entity'
class BoardRepository {
    private repo = AppDataSource.getRepository(Board)
    private roleRepo = AppDataSource.getRepository(Role)
    private userRepo = AppDataSource.getRepository(User)
    private boardMembersRepository = AppDataSource.getRepository(BoardMembers)
    async findAll(): Promise<Board[]> {
        return this.repo.find()
    }

    getBoardById = async (boardId: string): Promise<Board | null> => {
        return this.repo.findOne({ where: { id: boardId } })
    }
    updateBoard = async (boardId: string, updateData: Partial<Board>): Promise<Board | null> => {
        await this.repo.update(boardId, updateData)
        return this.repo.findOne({ where: { id: boardId } })
    }

    deleteBoard = async (boardId: string): Promise<void> => {
        await this.repo.delete(boardId)
    }
    async findMemberByEmail(boardId: string, email: string): Promise<boolean> {
        const board = await this.repo.findOne({
            where: { id: boardId },
            relations: { boardMembers: { user: true } }
        })
        if (!board) {
            throw new Error('Board not found')
        }
        return board.boardMembers.some((m) => m.user.email === email)
    }

    async findMemberByUserId(boardId: string, userId: string): Promise<BoardMembers | null> {
        const boardMemberRepo = AppDataSource.getRepository(BoardMembers)
        const member = await boardMemberRepo.findOne({
            where: {
                board: { id: boardId },
                user: { id: userId }
            },
            relations: ['role', 'user', 'board']
        })
        return member || null
    }

    async addMemberToBoard(boardId: string, userId: string, roleName: string): Promise<void> {
        const board = await this.repo.findOne({
            where: { id: boardId },
            relations: { boardMembers: { user: true } }
        })
        if (!board) {
            throw new Error('Board not found')
        }
        const userRepo = AppDataSource.getRepository(User)
        const user = await userRepo.findOne({ where: { id: userId } })
        const role: Role | null = await this.roleRepo.findOne({ where: { name: roleName } })
        if (!user) {
            throw new Error('User not found')
        }
        console.log('Adding user to board:', user.email, 'Board ID:', board.id, 'Role:', roleName)
        const boardMember = AppDataSource.getRepository('board_members').create({
            board: board,
            user: user,
            role: role!
        })
        console.log('Board Member Entity:', boardMember)
        await AppDataSource.getRepository('board_members').save(boardMember)
    }

    async changeOwner(boardId: string, currentOwnerId: string, newOwnerId: string) {
        const ownerRecord = await this.boardMembersRepository.findOne({
            where: { board: { id: boardId }, user: { id: currentOwnerId } },
            relations: ['role', 'user', 'board']
        })

        if (!ownerRecord || ownerRecord.role.name !== 'board_admin') {
            throw new Error('You are not the board owner')
        }

        const newOwnerRecord = await this.boardMembersRepository.findOne({
            where: { board: { id: boardId }, user: { id: newOwnerId } },
            relations: ['role', 'user', 'board']
        })

        if (!newOwnerRecord) {
            throw new Error('New owner must be a member of board')
        }
        if(newOwnerRecord.role.name !== 'board_member'){
            throw new Error('New owner is already board admin')
        }

        const adminRole = await this.roleRepo.findOne({ where: { name: 'board_admin' } })
        const memberRole = await this.roleRepo.findOne({ where: { name: 'board_member' } })

        ownerRecord.role = memberRole!
        newOwnerRecord.role = adminRole!

        await this.boardMembersRepository.save(ownerRecord)
        await this.boardMembersRepository.save(newOwnerRecord)

        return newOwnerRecord
    }

    async updateMemberRole(boardId: string, userId: string, roleName: string): Promise<void> {
        const board = await this.repo.findOne({
            where: { id: boardId },
            relations: { boardMembers: { user: true } }
        })
        if (!board) {
            throw new Error('Board not found')
        }
        const user = await this.userRepo.findOne({ where: { id: userId } })
        const role: Role | null = await this.roleRepo.findOne({ where: { name: roleName } })
        if (!user) {
            throw new Error('User not found')
        }
        await this.boardMembersRepository.update({ board: { id: boardId }, user: { id: userId } }, { role: role! })
    }

    async removeMember(boardId: string, userId: string): Promise<void> {
        const board = await this.repo.findOne({
            where: { id: boardId },
            relations: { boardMembers: { user: true } }
        })
        if (!board) {
            throw new Error('Board not found')
        }
        const user = await this.userRepo.findOne({ where: { id: userId } })
        if (!user) {
            throw new Error('User not found')
        }
        await AppDataSource.getRepository('board_members').delete({ board: { id: boardId }, user: { id: userId } })
    }

    async countOwners(boardId: string): Promise<number> {
        return this.boardMembersRepository.count({
            where: {
                board: { id: boardId },
                role: { name: 'board_admin' }
            }
        })
    }
}

export default new BoardRepository()
