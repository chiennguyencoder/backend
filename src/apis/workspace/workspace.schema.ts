import { Workspace } from './../../entities/workspace.entity';
import { z } from 'zod'
import { ZodRequestBody, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const WorkspaceSchema = z.object({
    title: z.string().min(1, 'Title is required').openapi({ description: 'Workspace name' }),
    description: z.string().optional().openapi({ description: 'Workspace description' })
})


// for request
export const CreateWorkspaceRequestSchema: ZodRequestBody = {
    description: 'Create new Workspace',
    content: {
        'application/json': {
            schema: WorkspaceSchema
        }
    }
}

export const AddWorkspaceMemberRequestSchema: ZodRequestBody = {
    description: 'Add member to workspace',
    content: {
        'application/json': {
            schema: z.object({
                email: z.string().email().openapi({ example: 'user@example.com' })
            })
        }
    }
}

// for response
export const GetMembersResponseSchema = z.array(
    z.object({
        id: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' }),
        username: z.string().openapi({ example: 'john_doe' }),
        email: z.string().email().openapi({ example: 'john_doe@example.com' }),
        role: z.enum(['workspace_admin', 'workspace_member']).openapi({ example: 'workspace_member' })
    })
)
