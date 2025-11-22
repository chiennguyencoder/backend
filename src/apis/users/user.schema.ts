import { z } from 'zod'
import { ZodRequestBody, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

// update user schema not id and google id
export const UpdateUserRequest = z.object({
    username: z.string().min(3).max(30).optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(6).max(100).optional(),
    avatarUrl: z.string().url().nullable().optional()
}).strict()