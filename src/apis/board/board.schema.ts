import {z} from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z)

export const UpdateBoardRequest = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).nullable().optional(),
    permissionLevel: z.enum(['private', 'workspace', 'public']).optional(),
}).strict()