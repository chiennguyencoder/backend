import { z } from 'zod'
import { ZodRequestBody, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

// Schema Create 
export const CreateUserSchema = z.object({
  username: z.string(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  bio: z.string().optional(),
  isActive: z.boolean().default(false).optional(),
  avatarUrl: z.string().url().optional(),
})
export type CreateUserInput = z.infer<typeof CreateUserSchema>

// SCHEMA UPDATE 
export const UpdateUserSchema = z.object({
  username: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().optional(),
  // Không cho phép update email, password, googleId ở đây 
})
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

// Schema Response 
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  isActive: z.boolean(), 
  createdAt: z.string().datetime().or(z.date()),
})

export const UsersResponseSchema = z.array(UserResponseSchema)