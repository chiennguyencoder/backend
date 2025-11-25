import { Board } from '@/entities/board.entity'
import { BoardMembers } from '@/entities/board-member.entity'
import { Workspace } from '@/entities/workspace.entity'
import { User } from '@/entities/user.entity'
import AppDataSource from '@/config/typeorm.config'

class BoardRepository {
  private boardRepo = AppDataSource.getRepository(Board)
  private boardMemberRepo = AppDataSource.getRepository(BoardMembers)
  private workspaceRepo = AppDataSource.getRepository(Workspace)
  private userRepo = AppDataSource.getRepository(User)

  
  createBoard = async (data: Partial<Board>, workspaceId: string, userId: string) => {
    const workspace = await this.workspaceRepo.findOne({ where: { id: workspaceId } })
    if (!workspace) throw new Error('Workspace not found')

    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const newBoard = this.boardRepo.create({
      ...data,
      workspace: workspace
    })
    const savedBoard = await this.boardRepo.save(newBoard)

    const member = this.boardMemberRepo.create({
      board: savedBoard,
      user: user,
      role: 1 
    })
    await this.boardMemberRepo.save(member)

    return savedBoard
  }

  getBoardsByWorkspace = async (workspaceId: string) => {
    return this.boardRepo.find({
      where: { workspace: { id: workspaceId } },
      order: { createdAt: 'DESC' }
    })
  }

  getBoardById = async (id: string) => {
    return this.boardRepo.findOne({
      where: { id },
      relations: ['workspace']
    })
  }

  getBoardMembers = async (boardId: string) => {
    return this.boardMemberRepo.find({
      where: { board: { id: boardId } },
      relations: ['user']
    })
  }

  isMemberOfBoard = async (userId: string, boardId: string) => {
    const member = await this.boardMemberRepo.findOne({
      where: { user: { id: userId }, board: { id: boardId } }
    })
    return !!member
  }
}

export default new BoardRepository()