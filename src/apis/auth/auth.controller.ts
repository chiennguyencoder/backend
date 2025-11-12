import { Request, Response, NextFunction } from 'express'
import AppDataSource from '@/config/typeorm.config'
import { User } from '@/entities/user.entity'
import { errorResponse } from '@/utils/response'
import { Status } from '@/types/response'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import redisClient from '@/config/redis.config';
import { successResponse } from '@/utils/response'
import { generateEmailToken, generateToken, verifyAccessToken, verifyRefreshToken } from '@/utils/jwt'
import { AuthRequest } from '@/types/auth-request'
import { Config } from '@/config/config'
import { sendVerificationEmail, sendTokenToResetPassword } from '@/utils/email';

const useRepo = AppDataSource.getRepository(User)

class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, name } = req.body
            const isExistEmail = await useRepo.findOneBy({ email })
            if (isExistEmail) {
                return next(errorResponse(Status.BAD_REQUEST, 'This email is already used!'))
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = useRepo.create({ email, password: hashedPassword, name })

            if (!newUser) {
                return next(errorResponse(Status.INTERNAL_SERVER_ERROR, 'Failed to create user'))
            }

            await useRepo.save(newUser)

           
            const emailToken = generateEmailToken(newUser.id);
            await sendVerificationEmail(email, emailToken);

            return res.status(201).json(successResponse(Status.CREATED, 'Register successfully'))
        } catch (err) {
            return next(err)
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body

            const user = await useRepo.findOneBy({ email })
            if (!user) {
                return next(errorResponse(Status.BAD_REQUEST, 'Invalid email'))
            }

            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) {
                return next(errorResponse(Status.BAD_REQUEST, 'Email or password is incorrect!'))
            }

            if (!user.isActive) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Please verify your email before logging in'))
            }

            const accessToken = await generateToken(user.id, 'access')
            const refreshToken = await generateToken(user.id, 'refresh')
            return res.json({ message: 'Login successfully!', accessToken, refreshToken })
        } catch (err) {
            return next(err)
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction){
        try{
            const {email} = req.body;
            const user = await useRepo.findOneBy({ email })
            if(!user){
                return next(errorResponse(Status.NOT_FOUND, 'User not found'))
            }

            const resetToken = await generateToken(user.id, 'reset');
            await sendTokenToResetPassword(email, resetToken);

            return res.json(successResponse(Status.OK, 'Password reset email sent'));
        }catch(err){
            return next(err)
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return next(errorResponse(Status.BAD_REQUEST, 'Token or newPassword is required'));
            }

            let payload: any;
            try {
                payload = jwt.verify(token, process.env.RESET_PASSWORD_SECRET!);
            } catch (err: any) {
                if (err.name === 'TokenExpiredError') {
                    return next(errorResponse(Status.BAD_REQUEST, 'Reset token expired'));
                }
                return next(errorResponse(Status.BAD_REQUEST, 'Invalid reset token'));
            }

            const user = await useRepo.findOneBy({ id: payload.user_id });
            if (!user) {
                return next(errorResponse(Status.NOT_FOUND, 'User not found'));
            }

            const redisToken = await redisClient.get(`${user.id}-reset`);
            if (redisToken !== token) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Invalid reset token'));
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await useRepo.save(user);

            await redisClient.del(`${user.id}-reset`);

            return res.json(successResponse(Status.OK, 'Password reset successfully'));
        } catch (err) {
            next(err);
        }
    }


    async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user_id = req.payload?.id
            if (!user_id) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Invalid access token'))
            }
            const accessToken = await generateToken(user_id, 'access')
            return res.json(successResponse(Status.OK, 'Generate access token successfully!', { accessToken }))
        } catch (err) {
            return next(errorResponse(Status.UNAUTHORIZED, 'Invalid refresh token'))
        }
    }

    async googleOAuthCallback(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = req.user?.id

            const accessToken = await generateToken(user_id as string, 'access')
            const refreshToken = await generateToken(user_id as string, 'refresh')

            res.cookie('refresh', refreshToken, {
                maxAge: Config.cookieMaxAge,
                httpOnly : true,
                secure : false,
                path : "/api/auth/refresh-token"
            })

            res.redirect(`${Config.corsOrigin}/oauth2?token=${accessToken}`)
        } catch (err) {
            res.redirect(`${Config.corsOrigin}/oauth2?token=null`)
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      if(!token){
        return next(errorResponse(Status.BAD_REQUEST, 'Token is required'));
      }
      
      let payload: any;
      try{
        payload = jwt.verify(token, process.env.VERIFY_SECRET!);
      }catch(err: any){
        if(err.name === 'TokenExpiredError'){
            return next(errorResponse(Status.BAD_REQUEST, 'Token expired'));
        }
        return next(errorResponse(Status.BAD_REQUEST, 'Invalid token'));
      }

      const user = await useRepo.findOneBy({ id: payload.id });
      if(!user){
        return next(errorResponse(Status.NOT_FOUND, 'User not found'));
    }

    if(user.isActive){
        return res.json(successResponse(Status.OK, 'Email already verified'));
    }
    user.isActive = true;
    await useRepo.save(user);

        return res.json(successResponse(Status.OK, 'Email verified successfully'));
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController()
