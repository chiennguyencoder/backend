import { z } from 'zod'
import { ZodRequestBody, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { Status } from '@/types/response'

extendZodWithOpenApi(z)

export const CreateWorkspaceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>

export const PostCreateWorkspace: ZodRequestBody = {
  description: 'Create a new workspace',
  content: {
    'application/json': {
      schema: CreateWorkspaceSchema,
    },
  },
}

export const WorkspaceResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  createdAt: z.string().datetime().or(z.date()),
  owner: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
  }).optional(),
})