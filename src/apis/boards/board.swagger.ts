import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { createApiResponse } from '@/api-docs/openApiResponseBuilder'
import { Status } from '@/types/response'
import { CreateBoardSchema, BoardResponseSchema, BoardMemberResponseSchema } from './board.schema'

export const boardRegistry = new OpenAPIRegistry()

export const boardRegisterPath = () => {
  boardRegistry.registerPath({
    method: 'post',
    path: '/api/workspaces/{id}/boards',
    tags: ['Boards'],
    summary: 'Create board',
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: { content: { 'application/json': { schema: CreateBoardSchema } } }
    },
    responses: {
      ...createApiResponse(BoardResponseSchema, 'Created', Status.CREATED),
      ...createApiResponse(z.object({ message: z.string() }), 'Error', Status.FORBIDDEN)
    }
  })

  boardRegistry.registerPath({
    method: 'get',
    path: '/api/workspaces/{id}/boards',
    tags: ['Boards'],
    summary: 'Get list boards',
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: createApiResponse(z.array(BoardResponseSchema), 'Success', Status.OK)
  })

  boardRegistry.registerPath({
    method: 'get',
    path: '/api/boards/{id}',
    tags: ['Boards'],
    summary: 'Get board info',
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      ...createApiResponse(BoardResponseSchema, 'Success', Status.OK),
      ...createApiResponse(z.null(), 'Not found', Status.NOT_FOUND)
    }
  })

  boardRegistry.registerPath({
    method: 'get',
    path: '/api/boards/{id}/members',
    tags: ['Boards'],
    summary: 'Get board members',
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: createApiResponse(z.array(BoardMemberResponseSchema), 'Success', Status.OK)
  })
}