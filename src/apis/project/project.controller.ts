import { NextFunction, Request, Response } from 'express'
import DataSource from '@/config/typeorm.config'
import { Project } from '@/entities/project.entity'
import { errorResponse, successResponse } from '@/utils/response'
import { Status } from '@/types/response'
import { ProjectRepository } from './project.repository'
import { AuthRequest } from '@/types/auth-request'

const repo = new ProjectRepository();


class ProjectController {

    async getAllProjects(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.payload
            if (!user) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
            }

            const data = await repo.findAll()

            return res.status(Status.OK).json(successResponse(Status.OK, 'Get all projects', data))
        } catch (err) {
            next(err)
        }
    }

    async createProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.payload
            if (!user) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
            }

            await repo.createProject(req.body)
            return res.status(Status.CREATED).json(successResponse(Status.CREATED, 'Created project'))
        } catch (err) {
            next(err)
        }
    }

    async updateProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.payload
            if (!user) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
            }

            const data = await repo.updateProject(req.params.id, req.body)
            return res.status(Status.OK).json(successResponse(Status.OK, 'Updated project', data))
        } catch (err) {
            next(err)
        }
    }

    async deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = req.payload
            if (!user) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
            }

            await repo.deleteProject(req.params.id)
            return res.status(Status.OK).json(successResponse(Status.OK, 'Deleted project'))
        } catch (err) {
            next(err)
        }
    }
}

export default new ProjectController()
