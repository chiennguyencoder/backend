import { Board } from '@/entities/board.entity'
import AppDataSource from '@/config/typeorm.config'
import { Role } from '@/entities/role.entity'
import { User } from '@/entities/user.entity'
import { BoardMembers } from '@/entities/board-member.entity'
import { Brackets } from 'typeorm'
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
    async getPublicBoards() {
        return this.repo.find({
            where: { permissionLevel: 'public', isArchived: false },
            select: ['id', 'title', 'description', 'backgroundPublicId', 'createdAt']
        })
    }

    async getAllBoardsForUser(userId: string) {
        return this.repo.createQueryBuilder('board')
            .leftJoinAndSelect('board.workspace', 'workspace')
            .leftJoin('workspace.workspaceMembers', 'wsMember', 'wsMember.userId = :userId', { userId })
            .leftJoin('board.boardMembers', 'boardMember', 'boardMember.userId = :userId', { userId })
            .where('board.isArchived = :isArchived', { isArchived: false })
            .andWhere(new Brackets(qb => {
                qb.where('board.permissionLevel = :public', { public: 'public' })
                  .orWhere('board.permissionLevel = :wsLevel AND wsMember.id IS NOT NULL', { wsLevel: 'workspace' })
                  .orWhere('boardMember.id IS NOT NULL')
            }))
            .select([
                'board.id', 'board.title', 'board.description', 'board.permissionLevel', 
                'board.backgroundPath', 'board.createdAt', 'board.updatedAt',
                'workspace.id', 'workspace.title'
            ])
            .orderBy('board.createdAt', 'DESC')
            .getMany()
    }

    async getBoardDetail(boardId: string, userId: string) {
        const board = await this.repo.createQueryBuilder('board')
            .leftJoinAndSelect('board.workspace', 'workspace')
            .leftJoin('workspace.workspaceMembers', 'wsMember', 'wsMember.userId = :userId', { userId })
            .leftJoinAndSelect('board.lists', 'lists')
            .leftJoinAndSelect('lists.cards', 'cards')
            .leftJoinAndSelect('board.boardMembers', 'members')
            .leftJoin('members.user', 'user')
            .addSelect(['user.id'])
            .where('board.id = :boardId', { boardId })
            .andWhere('board.isArchived = :isArchived', { isArchived: false })
            .getOne()

        if (!board) return null

        let hasAccess = false
        if (board.permissionLevel === 'public') hasAccess = true
        else if (board.permissionLevel === 'workspace') {
            const isWsMember = await AppDataSource.getRepository('workspace_members').exists({ 
                where: { workspace: { id: board.workspace.id }, user: { id: userId } } 
            })
            if (isWsMember) hasAccess = true
        }
        
        if (!hasAccess) {
            const isBoardMember = board.boardMembers.some(m => m.user.id === userId)
            if (isBoardMember) hasAccess = true
        }

        if (!hasAccess) throw new Error('Permission denied')
        
        return board
    }

    async createBoard(data: Partial<Board>, workspaceId: string, userId: string) {
        return await AppDataSource.transaction(async (manager) => {
            const workspace = await manager.findOne('workspaces', { where: { id: workspaceId } })
            if (!workspace) throw new Error('Workspace not found')

            const newBoard = manager.create(Board, {
                ...data,
                workspace: workspace,
                owner: { id: userId }
            })
            const savedBoard = await manager.save(newBoard)

            const adminRole = await manager.findOne(Role, { where: { name: 'board_admin' } })
            if (!adminRole) throw new Error('Role board_admin not found')

            const member = manager.create(BoardMembers, {
                board: savedBoard,
                user: { id: userId },
                role: adminRole
            })
            await manager.save(member)

            return savedBoard
        })
    }
}
export default new BoardRepository()