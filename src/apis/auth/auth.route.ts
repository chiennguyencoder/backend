import AuthController from './auth.controller'
import { Request, Router, Response } from 'express'
import { verifyRefreshToken } from '@/utils/jwt'
import { validateHandle } from '@/middleware/validate-handle'
import { RegisterSchema, LoginSchema } from './auth.validate'
import passport from 'passport'

const route = Router()

route.route('/register').post(validateHandle(RegisterSchema), AuthController.register)

route.route('/login').post(validateHandle(LoginSchema), AuthController.login)

route.route('/refresh-token').post(verifyRefreshToken, AuthController.refreshToken)

route.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }))

route.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req: Request, res: Response) => {
    res.redirect('/profile')
})

export default route
