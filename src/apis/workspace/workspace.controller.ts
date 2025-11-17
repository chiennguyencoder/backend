// src/apis/workspace/workspace.controller.ts
import { Request, Response, NextFunction } from 'express'
import { successResponse, errorResponse } from '@/utils/response'
import { Status } from '@/types/response'
import { AuthRequest } from '@/types/auth-request' 
import { UserRepository } from '../users/user.repository'
import { WorkspaceRepository } from './workspace.repository'
import { CreateWorkspaceInput } from './workspace.schema'

// 🔽 CHUYỂN 2 DÒNG NÀY RA BÊN NGOÀI CLASS 🔽
const workspaceRepo = new WorkspaceRepository()
const userRepo = new UserRepository()

class WorkspaceController {
  // 👈 Xóa 2 dòng private repo ở đây

  async createWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.payload?.user_id
      if (!ownerId) {
        return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
      }

      const owner = await userRepo.findById(ownerId) // 👈 Bỏ 'this.'
      if (!owner) {
        return next(errorResponse(Status.NOT_FOUND, 'Owner not found'))
      }

      const input = req.body as CreateWorkspaceInput
      const newWorkspace = await workspaceRepo.create(input, owner) // 👈 Bỏ 'this.'

      return res
        .status(Status.CREATED)
        .json(successResponse(Status.CREATED, 'Workspace created successfully', newWorkspace))
    } catch (err) {
      next(err)
    }
  }

  private async toggleArchive(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
    archiveState: boolean
  ) {
    try {
      const { id } = req.params
      const ownerId = req.payload?.user_id
      if (!ownerId) {
        return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
      }

      const workspace = await workspaceRepo.findByIdAndOwner(id, ownerId) // 👈 Bỏ 'this.'
      if (!workspace) {
        return next(errorResponse(Status.NOT_FOUND, 'Workspace not found or you are not the owner'))
      }

      const updatedWorkspace = await workspaceRepo.update(id, { isArchived: archiveState }) // 👈 Bỏ 'this.'
      const message = archiveState ? 'Workspace archived successfully' : 'Workspace reopened successfully'
      
      return res.json(successResponse(Status.OK, message, updatedWorkspace))
    } catch (err) {
      next(err)
    }
  }

  async archiveWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    // @ts-ignore
    return this.toggleArchive(req, res, next, true)
  }

  async reopenWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
    // @ts-ignore
    return this.toggleArchive(req, res, next, false)
  }
}

export default new WorkspaceController()