import { NextFunction, Request, Response } from 'express'
import DataSource from '@/config/typeorm.config'
import { Workspace } from '@/entities/workspace.entity'
import { errorResponse, successResponse } from '@/utils/response'
import { Status } from '@/types/response'
import { WorkspaceRepository } from './workspace.repository'
import { AuthRequest } from '@/types/auth-request'
import { create } from 'domain'
import { Roles } from '@/enums/roles.enum'

const repo = new WorkspaceRepository();


class WorkspaceController {

    async getAllWorkspaces(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.payload
            if (!user) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
            }

            const data = await repo.findAll()

            return res.status(Status.OK).json(successResponse(Status.OK, 'Get all workspaces', data))
        } catch (err) {
            next(err)
        }
    }

    async getWorkspaceByID(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.payload
            if (!user) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
            }
            // list workspace info and user with roles
            const workspace = await repo.findWithMembersById(req.params.id)

            if (!workspace) {
                return res.status(Status.NOT_FOUND).json(errorResponse(Status.NOT_FOUND, 'Workspace not found'))
            }
            const data = {
                id: workspace.id,
                title: workspace.title,
                description: workspace.description,
                members: workspace.workspaceMembers.map(wm => ({
                    id: wm.user.id,
                    username: wm.user.username,
                    role: wm.role.name
                }))
            }
            return res.status(Status.OK).json(successResponse(Status.OK, 'Get workspace by ID', data))
        } catch (err) {
            next(err)
        }
    }

    async createWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.payload
            if (!user) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
            }
            const createdWorkspace = await repo.createWorkspace(req.body)
            await repo.assignRoleWorkspace(user.id, createdWorkspace.id, Roles.WORKSPACE_ADMIN)

            return res.status(Status.CREATED).json(successResponse(Status.CREATED, 'Created workspace', createdWorkspace))
        } catch (err) {
            next(err)
        }
    }

    async updateWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.payload
            if (!user) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
            }

            const data = await repo.updateWorkspace(req.params.id, req.body)
            return res.status(Status.OK).json(successResponse(Status.OK, 'Updated workspace', data))
        } catch (err) {
            next(err)
        }
    }

    async deleteWorkspace(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.payload
            if (!user) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
            }

            await repo.deleteWorkspace(req.params.id)
            return res.status(Status.OK).json(successResponse(Status.OK, 'Deleted workspace'))
        } catch (err) {
            next(err)
        }
    }
}

export default new WorkspaceController()
