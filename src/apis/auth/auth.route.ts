import AuthController from './auth.controller';
import { Router } from "express";
import { verifyRefreshToken } from '@/utils/jwt';

const route = Router()

route.route('/register')
    .post(AuthController.register)


route.route('/login')
    .post(AuthController.login)

route.route('/refresh-token')
    .post(verifyRefreshToken, AuthController.refreshToken)
export default route

















