import z from 'zod'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    AddWorkspaceMemberRequestSchema,
    GetMembersResponseSchema,
    CreateWorkspaceRequestSchema
} from './workspace.schema'
import { createApiResponse } from '@/api-docs/openApiResponseBuilder'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z)

export const workspaceRegister = new OpenAPIRegistry()

export const registerPath = () => {
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
        request: { body: CreateWorkspaceRequestSchema },
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
            body: CreateWorkspaceRequestSchema
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
                workspaceId: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            }),
            body: AddWorkspaceMemberRequestSchema
        },
        responses: {}
    })
}
