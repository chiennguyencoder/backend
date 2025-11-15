import { Permissions } from './../../enums/permissions.enum'
import WorkspaceController from './workspace.controller'
import { Router } from 'express'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { verifyAccessToken } from '@/utils/jwt'
import z from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { AddWorkspaceMemberRequestSchema, GetMembersResponseSchema, WorkspaceSchema } from './workspace.schema'
import { validateHandle } from '@/middleware/validate-handle'
import { authorizePermission, authorizePermissionWorkspace } from '@/middleware/authorization'
import { createApiResponse } from '@/api-docs/openApiResponseBuilder'

extendZodWithOpenApi(z)
const router = Router()
export const workspaceRegister = new OpenAPIRegistry()

const registerPath = () => {
    workspaceRegister.registerPath({
        method: 'get',
        path: '/api/workspaces',
        tags: ['Workspace'],
        security: [{ bearerAuth: [], cookieAuth: [] }],
        responses: {
            200: {
                description: 'Get all workspace'
            }
        }
    })

    workspaceRegister.registerPath({
        method: 'post',
        path: '/api/workspaces',
        tags: ['Workspace'],
        security: [{ bearerAuth: [], cookieAuth: [] }],
        request: { body: WorkspaceRegisterRequestSchema },
        responses: {
            200: {
                description: 'Created workspace'
            }
        }
    })

    workspaceRegister.registerPath({
        method: 'delete',
        path: '/api/workspaces/{id}',
        tags: ['Workspace'],
        security: [{ bearerAuth: [], cookieAuth: [] }],
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
        path: '/api/workspaces/{id}',
        tags: ['Workspace'],
        security: [{ bearerAuth: [], cookieAuth: [] }],
        summary: 'Update workspace',
        request: {
            params: z.object({
                id: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            }),
            body: WorkspaceRegister
        },
        responses: createApiResponse(GetMembersResponseSchema, 'Success', 200)
    })

    workspaceRegister.registerPath({
        method: 'get',
        path: '/api/workspaces/{workspaceId}/members',
        tags: ['Workspace'],
        security: [{ bearerAuth: [], cookieAuth: [] }],
        summary: 'Get workspace members',
        request: {
            params: z.object({
                workspaceId: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            })
        },
        responses: createApiResponse(GetMembersResponseSchema, 'Success', 200)
    })

    workspaceRegister.registerPath({
        method: 'post',
        path: '/api/workspaces/{workspaceId}/members/{userId}',
        tags: ['Workspace'],
        security: [{ bearerAuth: [], cookieAuth: [] }],
        summary: 'Add member to workspace',
        request: {
            params: z.object({
                workspaceId: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' }),
                userId: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            })
        },
        responses: {}
    })

    workspaceRegister.registerPath({
        method: 'delete',
        path: '/api/workspaces/{workspaceId}/members',
        tags: ['Workspace'],
        security: [{ bearerAuth: [], cookieAuth: [] }],
        summary: 'Remove member from workspace',
        request: {
            params: z.object({
                workspaceId: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' }),
            }),
            body: AddWorkspaceMemberRequestSchema
        },
        responses: {}
    })
}

registerPath()

router
    .route('/')
    .get(verifyAccessToken, authorizePermission(Permissions.READ_WORKSPACE), WorkspaceController.getAllWorkspaces)
    .post(
        verifyAccessToken,
        authorizePermission(Permissions.CREATE_WORKSPACE),
        validateHandle(WorkspaceSchema),
        WorkspaceController.createWorkspace
    )

router
    .route('/:id')
    .delete(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.DELETE_WORKSPACE),
        WorkspaceController.deleteWorkspace
    )
    .put(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.UPDATE_WORKSPACE),
        WorkspaceController.updateWorkspace
    )
    .get(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.READ_WORKSPACE),
        WorkspaceController.getWorkspaceByID
    )

router
    .route('/:workspaceId/members')
    .get(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.READ_WORKSPACE_MEMBERS),
        WorkspaceController.getWorkspaceMembers
    )
    .post(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.ADD_MEMBER_TO_WORKSPACE),
        WorkspaceController.addMemberToWorkspace
    )
    .delete(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.REMOVE_MEMBER_FROM_WORKSPACE),
        WorkspaceController.removeMemberFromWorkspace
    )
export default router
