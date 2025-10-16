import { z } from 'zod'
import { ZodRequestBody, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const ProjectSchema = z.object({
    title: z.string().min(1).openapi({ description: 'Project name' }),
    description: z.string().optional().openapi({ description: 'Project description' })
})

export const ProjectRegister: ZodRequestBody = {
    description: 'Create new Projecct',
    content: {
        'application/json': {
            schema: ProjectSchema
        }
    }
}
