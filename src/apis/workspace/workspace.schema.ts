import { z } from 'zod'
import { ZodRequestBody, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const WorkspaceSchema = z.object({
    title: z.string().min(1).openapi({ description: 'Workspace name' }),
    description: z.string().optional().openapi({ description: 'Workspace description' })
})

export const WorkspaceRegister: ZodRequestBody = {
    description: 'Create new Workspace',
    content: {
        'application/json': {
            schema: WorkspaceSchema
        }
    }
}
