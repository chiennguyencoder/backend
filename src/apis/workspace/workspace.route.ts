import { Router } from 'express'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { validateHandle } from '@/middleware/validate-handle'
import { verifyAccessToken } from '@/utils/jwt'
import { createApiResponse } from '@/api-docs/openApiResponseBuilder'
import { CreateWorkspaceSchema, PostCreateWorkspace, WorkspaceResponseSchema } from './workspace.schema'
import WorkspaceController from './workspace.controller'
import { z } from 'zod'
import { Status } from '@/types/response'

export const workspaceRegistry = new OpenAPIRegistry()
const route = Router()

workspaceRegistry.registerPath({
    method: 'post',
    path: '/api/workspaces',
    tags: ['Workspace'],
    summary: 'Create a new workspace',
    security: [{ bearerAuth: [] }],
    request: { body: PostCreateWorkspace },
    responses: createApiResponse(WorkspaceResponseSchema, 'Workspace created successfully', Status.CREATED)
})

workspaceRegistry.registerPath({
    method: 'put',
    path: '/api/workspaces/{id}/archive',
    tags: ['Workspace'],
    summary: 'Archive a workspace',
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: createApiResponse(WorkspaceResponseSchema, 'Workspace archived successfully')
})

workspaceRegistry.registerPath({
    method: 'put',
    path: '/api/workspaces/{id}/reopen',
    tags: ['Workspace'],
    summary: 'Reopen an archived workspace',
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: createApiResponse(WorkspaceResponseSchema, 'Workspace reopened successfully')
})

route.post('/', verifyAccessToken, validateHandle(CreateWorkspaceSchema), WorkspaceController.createWorkspace)

route.put('/:id/archive', verifyAccessToken, WorkspaceController.archiveWorkspace)

route.put('/:id/reopen', verifyAccessToken, WorkspaceController.reopenWorkspace)

export default route
