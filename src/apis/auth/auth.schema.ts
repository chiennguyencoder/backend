import { z } from 'zod'
import { ZodRequestBody, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
})
export type LoginInput = z.infer<typeof LoginSchema>

export const RegisterSchema = z.object({
    username: z.string(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
})
export type RegisterInput = z.infer<typeof RegisterSchema>

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address')
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long')
})
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

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

export const PostForgotPassword: ZodRequestBody = {
    description: 'Request to reset password',
    content: {
        'application/json': {
            schema: forgotPasswordSchema
        }
    }
}

export const PostResetPassword: ZodRequestBody = {
    description: 'Reset password using OTP',
    content: {
        'application/json': {
            schema: resetPasswordSchema
        }
    }
}
