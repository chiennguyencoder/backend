import { z } from 'zod'
import { ZodRequestBody, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
})
export type LoginInput = z.infer<typeof LoginSchema>

export const RegisterSchema = z.object({
    name: z.string(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
})
export type RegisterInput = z.infer<typeof RegisterSchema>

export const TokenSchema = z.object({
    refreshToken: z.string(),
    accessToken: z.string()
})

export const PostLogin: ZodRequestBody = {
    description: 'Login to continue',
    content: {
        'application/json': {
            schema: LoginSchema
        }
    }
}

export const PostRegister: ZodRequestBody = {
    description: 'Create new user',
    content: {
        'application/json': {
            schema: RegisterSchema
        }
    }
}
