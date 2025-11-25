import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const CreateBoardSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  backgroundUrl: z.string().optional(),
  permissionLevel: z.enum(['private', 'workspace', 'public']).default('workspace')
}).openapi({
  example: {
    title: 'New Project',
    description: 'Project description',
    permissionLevel: 'workspace',
    backgroundUrl: 'https://example.com/bg.jpg'
  }
})

export const BoardResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  backgroundUrl: z.string().nullable().optional(),
  permissionLevel: z.enum(['private', 'workspace', 'public']),
  workspaceId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const BoardMemberResponseSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string(),
  email: z.string().email(),
  avatar: z.string().nullable().optional(),
  role: z.number()
})