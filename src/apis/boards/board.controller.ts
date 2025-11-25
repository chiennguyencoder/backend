import { NextFunction, Response } from 'express'
import { AuthRequest } from '@/types/auth-request'
import { successResponse, errorResponse } from '@/utils/response'
import { Status } from '@/types/response'
import BoardRepository from './board.repository'
import { WorkspaceMembers } from '@/entities/workspace-member.entity'
import AppDataSource from '@/config/typeorm.config'

class BoardController {
  
  createBoard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.id
      const userId = req.user?.id
      if (!userId) return next(errorResponse(Status.UNAUTHORIZED, 'Unauthorized'))

      const board = await BoardRepository.createBoard(req.body, workspaceId, userId)
      
      const data = {
        ...board,
        workspaceId: workspaceId
      }
      return res.status(Status.CREATED).json(successResponse(Status.CREATED, 'Created board successfully', data))
    } catch (err: any) {
      next(err)
    }
  }

  getAllBoards = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.id
      const boards = await BoardRepository.getBoardsByWorkspace(workspaceId)
      return res.json(successResponse(Status.OK, 'Get boards successfully', boards))
    } catch (err) {
      next(err)
    }
  }

  getBoard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.user?.id
      if (!userId) return next(errorResponse(Status.UNAUTHORIZED, 'Unauthorized'))

      const board = await BoardRepository.getBoardById(id)
      if (!board) return next(errorResponse(Status.NOT_FOUND, 'Board not found'))

      let allow = false
      if (board.permissionLevel === 'public') {
        allow = true
      } else {
        const isMember = await BoardRepository.isMemberOfBoard(userId, id)
        if (isMember) {
          allow = true
        } else if (board.permissionLevel === 'workspace') {
            const wsRepo = AppDataSource.getRepository(WorkspaceMembers)
            const inWs = await wsRepo.findOne({
                where: { workspace: { id: board.workspace.id }, user: { id: userId } }
            })
            if (inWs) allow = true
        }
      }

      if (!allow) return next(errorResponse(Status.FORBIDDEN, 'You do not have permission'))

      const data = {
        id: board.id,
        title: board.title,
        description: board.description,
        background: board.backgroundUrl,
        visibility: board.permissionLevel,
        workspaceId: board.workspace.id,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt
      }
      return res.json(successResponse(Status.OK, 'Get board details successfully', data))
    } catch (err) {
      next(err)
    }
  }

  getAllMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.user?.id
      if (!userId) return next(errorResponse(Status.UNAUTHORIZED, 'Unauthorized'))

      const board = await BoardRepository.getBoardById(id)
      if (!board) return next(errorResponse(Status.NOT_FOUND, 'Board not found'))

      const isMember = await BoardRepository.isMemberOfBoard(userId, id)
      if (!isMember && board.permissionLevel !== 'public') {
         return next(errorResponse(Status.FORBIDDEN, 'Forbidden'))
      }

      const members = await BoardRepository.getBoardMembers(id)
      
      const result = members.map(m => ({
        userId: m.user.id,
        fullName: m.user.username,
        email: m.user.email,
        avatar: m.user.avatarUrl,
        role: m.role
      }))

      return res.json(successResponse(Status.OK, 'Get board members successfully', result))
    } catch (err) {
      next(err)
    }
  }
}

export default new BoardController()