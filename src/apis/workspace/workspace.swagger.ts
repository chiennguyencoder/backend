import z from 'zod'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    CreateWorkspaceRequestSchema,
    UpdateWorkspaceRequestSchema,
    AddWorkspaceMemberRequestSchema,
    RemoveMemberRequestSchema,
    InvitationResponseSchema,
    WorkspaceResponseSchema,
    WorkspaceDetailResponseSchema,
    WorkspaceMemberSchema,
    InvitationSchema
} from './workspace.schema'
import { createApiResponse } from '@/api-docs/openApiResponseBuilder'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { Status } from '@/types/response'

extendZodWithOpenApi(z)

export const workspaceRegister = new OpenAPIRegistry()

export const registerPath = () => {
    // GET /api/workspaces - Get all workspaces
    workspaceRegister.registerPath({
        method: 'get',
        path: '/api/workspaces',
        tags: ['Workspace'],
        summary: 'Get all workspaces',
        security: [{ bearerAuth: [] }],
        responses: {
            ...createApiResponse(z.array(WorkspaceResponseSchema), 'Get all workspaces successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('Authentication required') }), 'Authentication required', Status.UNAUTHORIZED)
        }
    })

    // POST /api/workspaces - Create new workspace
    workspaceRegister.registerPath({
        method: 'post',
        path: '/api/workspaces',
        tags: ['Workspace'],
        summary: 'Create a new workspace',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Create workspace request body',
                content: {
                    'application/json': {
                        schema: CreateWorkspaceRequestSchema
                    }
                }
            }
        },
        responses: {
            ...createApiResponse(WorkspaceResponseSchema, 'Created workspace successfully', Status.CREATED),
            ...createApiResponse(z.object({ message: z.literal('Authentication required') }), 'Authentication required', Status.UNAUTHORIZED),
            ...createApiResponse(z.object({ message: z.literal('Permission denied') }), 'Permission denied', Status.FORBIDDEN)
        }
    })

    // GET /api/workspaces/invitations - Get all invitations for user
    workspaceRegister.registerPath({
        method: 'get',
        path: '/api/workspaces/invitations',
        tags: ['Workspace'],
        summary: 'Get all workspace invitations for current user',
        security: [{ bearerAuth: [] }],
        responses: {
            ...createApiResponse(z.array(InvitationSchema), 'Get all invitations successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('Authentication required') }), 'Authentication required', Status.UNAUTHORIZED)
        }
    })

    // POST /api/workspaces/invitations/{workspaceId} - Respond to invitation
    workspaceRegister.registerPath({
        method: 'post',
        path: '/api/workspaces/invitations/{workspaceId}',
        tags: ['Workspace'],
        summary: 'Respond to workspace invitation',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                workspaceId: z.string().uuid().openapi({ 
                    example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17',
                    description: 'Workspace ID'
                })
            }),
            body: {
                description: 'Invitation response',
                content: {
                    'application/json': {
                        schema: InvitationResponseSchema
                    }
                }
            }
        },
        responses: {
            ...createApiResponse(z.null(), 'Responded to invitation successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('Authentication required') }), 'Authentication required', Status.UNAUTHORIZED),
            ...createApiResponse(z.object({ message: z.literal('Invitation not found') }), 'Invitation not found', Status.NOT_FOUND)
        }
    })

    // GET /api/workspaces/{id} - Get workspace by ID
    workspaceRegister.registerPath({
        method: 'get',
        path: '/api/workspaces/{id}',
        tags: ['Workspace'],
        summary: 'Get workspace by ID with members',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().uuid().openapi({ 
                    example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17',
                    description: 'Workspace ID'
                })
            })
        },
        responses: {
            ...createApiResponse(WorkspaceDetailResponseSchema, 'Get workspace successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('Workspace not found') }), 'Workspace not found', Status.NOT_FOUND),
            ...createApiResponse(z.object({ message: z.literal('Permission denied') }), 'Permission denied', Status.FORBIDDEN)
        }
    })

    // PUT /api/workspaces/{id} - Update workspace
    workspaceRegister.registerPath({
        method: 'put',
        path: '/api/workspaces/{id}',
        tags: ['Workspace'],
        summary: 'Update workspace',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().uuid().openapi({ 
                    example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17',
                    description: 'Workspace ID'
                })
            }),
            body: {
                description: 'Update workspace request body',
                content: {
                    'application/json': {
                        schema: UpdateWorkspaceRequestSchema
                    }
                }
            }
        },
        responses: {
            ...createApiResponse(WorkspaceResponseSchema, 'Updated workspace successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('Workspace not found') }), 'Workspace not found', Status.NOT_FOUND),
            ...createApiResponse(z.object({ message: z.literal('Permission denied') }), 'Permission denied', Status.FORBIDDEN)
        }
    })

    // DELETE /api/workspaces/{id} - Delete workspace
    workspaceRegister.registerPath({
        method: 'delete',
        path: '/api/workspaces/{id}',
        tags: ['Workspace'],
        summary: 'Delete workspace',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string().uuid().openapi({ 
                    example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17',
                    description: 'Workspace ID'
                })
            })
        },
        responses: {
            ...createApiResponse(z.null(), 'Deleted workspace successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('Workspace not found') }), 'Workspace not found', Status.NOT_FOUND),
            ...createApiResponse(z.object({ message: z.literal('Permission denied') }), 'Permission denied', Status.FORBIDDEN)
        }
    })

    // GET /api/workspaces/{workspaceId}/members - Get workspace members
    workspaceRegister.registerPath({
        method: 'get',
        path: '/api/workspaces/{workspaceId}/members',
        tags: ['Workspace'],
        summary: 'Get workspace members',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                workspaceId: z.string().uuid().openapi({ 
                    example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17',
                    description: 'Workspace ID'
                })
            })
        },
        responses: {
            ...createApiResponse(z.array(WorkspaceMemberSchema), 'Get workspace members successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('Workspace not found') }), 'Workspace not found', Status.NOT_FOUND),
            ...createApiResponse(z.object({ message: z.literal('Permission denied') }), 'Permission denied', Status.FORBIDDEN)
        }
    })

    // POST /api/workspaces/{workspaceId}/members - Add member to workspace
    workspaceRegister.registerPath({
        method: 'post',
        path: '/api/workspaces/{workspaceId}/members',
        tags: ['Workspace'],
        summary: 'Add member to workspace',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                workspaceId: z.string().uuid().openapi({ 
                    example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17',
                    description: 'Workspace ID'
                })
            }),
            body: {
                description: 'Add member request body',
                content: {
                    'application/json': {
                        schema: AddWorkspaceMemberRequestSchema
                    }
                }
            }
        },
        responses: {
            ...createApiResponse(z.null(), 'Added member to workspace successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('Workspace not found') }), 'Workspace not found', Status.NOT_FOUND),
            ...createApiResponse(z.object({ message: z.literal('User not found') }), 'User not found', Status.NOT_FOUND),
            ...createApiResponse(z.object({ message: z.literal('User is already a member of the workspace') }), 'User is already a member', Status.BAD_REQUEST),
            ...createApiResponse(z.object({ message: z.literal('Permission denied') }), 'Permission denied', Status.FORBIDDEN)
        }
    })

    // DELETE /api/workspaces/{workspaceId}/members - Remove member from workspace
    workspaceRegister.registerPath({
        method: 'delete',
        path: '/api/workspaces/{workspaceId}/members',
        tags: ['Workspace'],
        summary: 'Remove member from workspace',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                workspaceId: z.string().uuid().openapi({ 
                    example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17',
                    description: 'Workspace ID'
                })
            }),
            body: {
                description: 'Remove member request body',
                content: {
                    'application/json': {
                        schema: RemoveMemberRequestSchema
                    }
                }
            }
        },
        responses: {
            ...createApiResponse(z.null(), 'Removed member from workspace successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('User not found') }), 'User not found', Status.NOT_FOUND),
            ...createApiResponse(z.object({ message: z.literal('Permission denied') }), 'Permission denied', Status.FORBIDDEN)
        }
    })

    // POST /api/workspaces/{workspaceId}/archive - Archive workspace
    workspaceRegister.registerPath({
        method: 'post',
        path: '/api/workspaces/{workspaceId}/archive',
        tags: ['Workspace'],
        summary: 'Archive workspace',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                workspaceId: z.string().uuid().openapi({ 
                    example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17',
                    description: 'Workspace ID'
                })
            })
        },
        responses: {
            ...createApiResponse(z.null(), 'Archived workspace successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('Authentication required') }), 'Authentication required', Status.UNAUTHORIZED),
            ...createApiResponse(z.object({ message: z.literal('Permission denied') }), 'Permission denied', Status.FORBIDDEN),
            ...createApiResponse(z.object({ message: z.literal('Workspace not found') }), 'Workspace not found', Status.NOT_FOUND)
        }
    })

    // POST /api/workspaces/{workspaceId}/unarchive - Unarchive workspace
    workspaceRegister.registerPath({
        method: 'post',
        path: '/api/workspaces/{workspaceId}/unarchive',
        tags: ['Workspace'],
        summary: 'Unarchive (reopen) workspace',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                workspaceId: z.string().uuid().openapi({ 
                    example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17',
                    description: 'Workspace ID'
                })
            })
        },
        responses: {
            ...createApiResponse(z.null(), 'Reopened workspace successfully', Status.OK),
            ...createApiResponse(z.object({ message: z.literal('Authentication required') }), 'Authentication required', Status.UNAUTHORIZED),
            ...createApiResponse(z.object({ message: z.literal('Permission denied') }), 'Permission denied', Status.FORBIDDEN),
            ...createApiResponse(z.object({ message: z.literal('Workspace not found') }), 'Workspace not found', Status.NOT_FOUND)
        }
    })
}