import AuthController from './auth.controller'
import { Router } from 'express'
import { verifyAccessToken, verifyRefreshToken } from '@/utils/jwt'
import { validateHandle } from '@/middleware/validate-handle'
import {
    RegisterSchema,
    LoginSchema,
    TokenSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    sendEmailSchema
} from './auth.schema'
import passport from 'passport'
import { AuthRegisterPath } from './auth.swagger'

const route = Router()

AuthRegisterPath()

route.route('/register').post(validateHandle(RegisterSchema), AuthController.register.bind(AuthController))
route.route('/login').post(validateHandle(LoginSchema), AuthController.login)
route.route('/refresh-token').post(verifyRefreshToken, AuthController.refreshToken)

route.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }))
route.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    AuthController.googleOAuthCallback
)

route.get('/me', verifyAccessToken, AuthController.me)

route.post('/forgot-password', validateHandle(forgotPasswordSchema), AuthController.forgotPassword)
route.post('/reset-password', validateHandle(resetPasswordSchema), AuthController.resetPassword)
route.post('/send-verify-email', validateHandle(sendEmailSchema), AuthController.sendVerifyEmail)
route.get('/verify-email', AuthController.verifyEmail)

export default route
