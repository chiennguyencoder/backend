import { createApiResponse } from '@/api-docs/openApiResponseBuilder'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { PostRegister } from '../auth/auth.schema'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import {
    inviteByEmailSchema,
    acceptInviteSchema,
    joinViaShareLinkSchema,
    createShareLinkSchema,
    revokeShareLinkSchema,
    updateMemberRoleSchema
} from './board.schema'
extendZodWithOpenApi(z)

export const boardRegistry = new OpenAPIRegistry()

export const boardsRegisterPath = () => {
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/boards/{boardId}/invite/email',
        tags: ['Board'],
        summary: 'Invite user to board via email',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                boardId: z.string().uuid().openapi({ example: '322f3d3b-8cd0-4a1d-b0e2-11f3123adf44' })
            }),
            body: {
                content: {
                    'application/json': {
                        schema: inviteByEmailSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Invitation sent successfully',
                content: {
                    'application/json': {
                        schema: z.object({
                            status: z.number(),
                            message: z.string()
                        })
                    }
                }
            },
            403: {
                description: 'Already a member'
            }
        }
    })

    boardRegistry.registerPath({
        method: 'get',
        path: '/api/boards/accept-invite',
        tags: ['Board'],
        summary: 'Accept board invitation via email',
        security: [{ bearerAuth: [] }],
        request: {
            query: acceptInviteSchema
        },
        responses: {
            200: {
                description: 'Joined board successfully',
                content: {
                    'application/json': {
                        schema: z.object({
                            status: z.number(),
                            message: z.string()
                        })
                    }
                }
            },
            400: {
                description: 'Invalid or expired token'
            }
        }
    })

    boardRegistry.registerPath({
        method: 'post',
        path: '/api/boards/{boardId}/invite/link',
        tags: ['Board'],
        summary: 'Create share link for board',
        security: [{ bearerAuth: [] }],
        description: 'Create share link for board',
        request: {
            params: z.object({
                boardId: z.string().uuid()
            }),
            body: {
                content: {
                    'application/json': {
                        schema: createShareLinkSchema
                    }
                }
            }
        },
        responses: {
            200: { description: 'Share link created' }
        }
    })

    boardRegistry.registerPath({
        method: 'get',
        path: '/api/boards/join',
        tags: ['Board'],
        summary: 'Join board via share link',
        security: [{ bearerAuth: [] }],
        description: 'Join board via share link',

        request: {
            query: joinViaShareLinkSchema
        },

        responses: {
            200: { description: 'Successfully joined the board' },
            400: { description: 'Invalid or expired share link' }
        }
    })

    // boardRegistry.registerPath({
    //     method: 'delete',
    //     path: '/api/boards/revoke-link',
    //     tags: ['Board'],
    //     security: [{ bearerAuth: [] }],
    //     description: 'Revoke share link',

    //     request: {
    //         query: revokeShareLinkSchema
    //     },

    //     responses: {
    //         200: { description: 'Share link revoked' }
    //     }
    // })

    boardRegistry.registerPath({
        method: 'patch',
        path: '/api/boards/{boardId}/members/{userId}/role',
        tags: ['Board'],
        summary: 'Update member role in board',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                boardId: z.string().uuid(),
                userId: z.string().uuid()
            }),
            body: {
                content: {
                    'application/json': {
                        schema: updateMemberRoleSchema
                    }
                }
            }
        },
        responses: {
            ...createApiResponse(
                z.object({
                    status: z.literal(200),
                    message: z.string(),
                    data: z.optional(z.any())
                }),
                'Member role updated successfully'
            ),
            400: { description: 'boardId, userId and roleName are required' },
            404: { description: 'User is not a member of the board | Role not found' }
        }
    })

    boardRegistry.registerPath({
        method: 'delete',
        path: '/api/boards/{boardId}/members/{userId}',
        tags: ['Board'],
        summary: 'Remove member from board',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                boardId: z.string().uuid(),
                userId: z.string().uuid()
            })
        },
        responses: {
            ...createApiResponse(
                z.object({
                    status: z.literal(200),
                    message: z.string(),
                    data: z.optional(z.any())
                }),
                'Member removed successfully'
            ),
            404: { description: 'User is not a member of the board' }
        }
    })
}
boardsRegisterPath()
