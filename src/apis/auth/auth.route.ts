import { z } from 'zod'
import AuthController from './auth.controller'
import { Request, Router, Response } from 'express'
import { verifyRefreshToken } from '@/utils/jwt'
import { validateHandle } from '@/middleware/validate-handle'
import { RegisterSchema, LoginSchema, TokenSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { PostLogin, PostRegister, PostForgotPassword, PostResetPassword } from './auth.schema'
import { createApiResponse } from '@/api-docs/openApiResponseBuilder'

import passport from 'passport'
import { Status } from '@/types/response'
export const authRegistry = new OpenAPIRegistry()

const route = Router()

const registerPath = () => {
    authRegistry.registerPath({
        method: 'post',
        path: '/api/auth/login',
        tags: ['Auth'],
        request: { body: PostLogin },
        responses: createApiResponse(TokenSchema, 'Success')
    })

    authRegistry.registerPath({
        method: 'post',
        path: '/api/auth/register',
        tags: ['Auth'],
        request: { body: PostRegister },
        responses: createApiResponse(z.null(), 'Success')
    })

    authRegistry.registerPath({
        method: 'post',
        path: '/api/auth/refresh-token',
        tags: ['Auth'],
        summary: 'Refresh access token',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'Verify refresh token to return access token'
            }
        }
    })

    authRegistry.registerPath({
        method: 'get',
        path: '/api/auth/google',
        tags: ['Auth'],
        responses: {
            302: {
                description: 'Redirect to Google OAuth'
            }
        }
    })
    authRegistry.registerPath({
        method: 'get',
        path: '/api/auth/google/callback',
        tags: ['Auth'],
        responses: {
            302: {
                description: 'Redirect after authentication'
            }
        }
    })

    authRegistry.registerPath({
        method: 'post',
        path: '/api/auth/forgot-password',
        tags: ['Auth'],
        request: { body: PostForgotPassword },
        responses: {
            200: {
                description: 'OTP sent to email successfully'
            }
        }
    })

    authRegistry.registerPath({
        method: 'post',
        path: '/api/auth/reset-password',
        tags: ['Auth'],
        request: { body: PostResetPassword },
        responses: {
            200: {
                description: 'Reset password successfully'
            }
        }
    })
}

registerPath()

route.route('/register').post(validateHandle(RegisterSchema), AuthController.register)

route.route('/login').post(validateHandle(LoginSchema), AuthController.login)

route.route('/refresh-token').post(verifyRefreshToken, AuthController.refreshToken)

route.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

route.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    AuthController.googleOAuthCallback
)

route.post('/forgot-password', AuthController.forgotPassword)

route.post('/reset-password', AuthController.resetPassword)

export default route
