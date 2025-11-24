import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { UpdateBoardRequest } from './board.schema'
extendZodWithOpenApi(z)

export const boardRegistry = new OpenAPIRegistry()

export const boardsRegisterPath = () => {
    // Update board by id
    boardRegistry.registerPath({
        method: 'patch',
        path: '/api/boards/{boardId}',
        request: {
            params: z.object({
                boardId: z.string().openapi({ example: 'bb7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            }),
            body: {
                description: 'Update board data',
                content: {
                    'application/json': {
                        schema: UpdateBoardRequest
                    }
                }
            }
        },
        summary: 'Update board by id',
        security: [{ BearerAuth: [] }],
        tags: ['Boards'],
        responses: {}
    })

    // Archive board
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/boards/{boardId}/archive',
        summary: 'Archive board by id',
        security: [{ BearerAuth: [] }],
        tags: ['Boards'],
        request: {
            params: z.object({
                boardId: z.string().openapi({ example: 'bb7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            })
        },
        responses: {
            200: { description: 'Board archived successfully' },
            500: { description: 'Failed to archive board' }
        }
    })

    // Reopen board
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/boards/{boardId}/reopen',
        summary: 'Reopen board by id',
        security: [{ BearerAuth: [] }],
        tags: ['Boards'],
        request: {
            params: z.object({
                boardId: z.string().openapi({ example: 'bb7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            })
        },
        responses: {
            200: { description: 'Board reopened successfully' },
            500: { description: 'Failed to reopen board' }
        }
    })

    // Upload board background
    boardRegistry.registerPath({
        method: 'post',
        path: '/api/boards/{boardId}/background',
        summary: 'Upload board background',
        security: [{ BearerAuth: [] }],
        tags: ['Boards'],
        request: {
            params: z.object({
                boardId: z.string().openapi({ example: 'bb7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            }),
            body: {
                description: 'Board background image file',
                content: {
                    'multipart/form-data': {
                        schema: z.object({
                            background: z.instanceof(File).openapi({ type: 'string', format: 'binary' })
                        })
                    }
                }
            }
        },
        responses: {
            200: { description: 'Background uploaded successfully' },
            500: { description: 'Failed to upload background' }
        }
    })

    // Delete board permanently
    boardRegistry.registerPath({
        method: 'delete',
        path: '/api/boards/{boardId}',
        summary: 'Delete board permanently by id',
        security: [{ BearerAuth: [] }],
        tags: ['Boards'],
        request: {
            params: z.object({
                boardId: z.string().openapi({ example: 'bb7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            })
        },
        responses: {
            200: { description: 'Board deleted permanently' },
            500: { description: 'Failed to delete board' }
        }
    })
}