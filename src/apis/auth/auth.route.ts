import AuthController from './auth.controller';
import { Router } from "express";
import { verifyRefreshToken } from '@/utils/jwt';
import { validateHandle } from '@/middleware/validate-handle';
import { RegisterSchema, LoginSchema } from './auth.validate';

const route = Router()

route.route('/register')
    .post(validateHandle(RegisterSchema), AuthController.register)


route.route('/login')
    .post(validateHandle(LoginSchema), AuthController.login)

route.route('/refresh-token')
    .post(verifyRefreshToken, AuthController.refreshToken)
export default route
