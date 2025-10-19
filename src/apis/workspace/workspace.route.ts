import WorkspaceController from './workspace.controller'
import { Router } from 'express'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { verifyAccessToken } from '@/utils/jwt'
import z from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { WorkspaceRegister } from './workspace.schema'

extendZodWithOpenApi(z)
const router = Router()
export const workspaceRegister = new OpenAPIRegistry()

const registerPath = () => {
    workspaceRegister.registerPath({
        method: 'get',
        path: '/api/workspace',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],

        responses: {
            200: {
                description: 'Get all workspace'
            }
        }
    })

    workspaceRegister.registerPath({
        method: 'post',
        path: '/api/workspace',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: { body: WorkspaceRegister },
        responses: {
            200: {
                description: 'Created workspace'
            }
        }
    })

    workspaceRegister.registerPath({
        method: 'delete',
        path: '/api/workspace/{id}',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            })
        },
        responses: {
            200: {
                description: 'Delete workspace'
            }
        }
    })

    workspaceRegister.registerPath({
        method: 'put',
        path: '/api/workspace/{id}',
        tags: ['Workspace'],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            }),
            body: WorkspaceRegister
        },

        responses: {
            200: {
                description: 'update workspace'
            }
        }
    })
}

registerPath()

router
    .route('/')
    .get(verifyAccessToken, WorkspaceController.getAllWorkspaces)
    .post(verifyAccessToken, WorkspaceController.createWorkspace)

router
    .route('/:id')
    .delete(verifyAccessToken, WorkspaceController.deleteWorkspace)
    .put(verifyAccessToken, WorkspaceController.updateWorkspace)
export default router
