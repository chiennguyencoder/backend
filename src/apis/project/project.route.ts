import ProjectController from './project.controller'
import { Router } from 'express'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { verifyAccessToken } from '@/utils/jwt'
import z from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { ProjectRegister } from './project.schema'

extendZodWithOpenApi(z)
const router = Router()
export const projectRegister = new OpenAPIRegistry()

const registerPath = () => {
    projectRegister.registerPath({
        method: 'get',
        path: '/api/project',
        tags: ['Project'],
        security: [{ bearerAuth: [] }],

        responses: {
            200: {
                description: 'Get all project'
            }
        }
    })

    projectRegister.registerPath({
        method: 'post',
        path: '/api/project',
        tags: ['Project'],
        security: [{ bearerAuth: [] }],
        request: { body: ProjectRegister },
        responses: {
            200: {
                description: 'Created project'
            }
        }
    })

    projectRegister.registerPath({
        method: 'delete',
        path: '/api/project/{id}',
        tags: ['Project'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            })
        },
        responses: {
            200: {
                description: 'Delete project'
            }
        }
    })

    projectRegister.registerPath({
        method: 'put',
        path: '/api/project/{id}',
        tags: ['Project'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            }),
            body: ProjectRegister
        },

        responses: {
            200: {
                description: 'update project'
            }
        }
    })
}

registerPath()

router
    .route('/')
    .get(verifyAccessToken, ProjectController.getAllProjects)
    .post(verifyAccessToken, ProjectController.createProject)

router
    .route('/:id')
    .delete(verifyAccessToken, ProjectController.deleteProject)
    .put(verifyAccessToken, ProjectController.updateProject)
export default router
