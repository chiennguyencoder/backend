import redisClient from '@/config/redis.config'
import { Request, Response, NextFunction } from 'express'
import AppDataSource from '@/config/typeorm.config'
import { User } from '@/entities/user.entity'
import { errorResponse } from '@/utils/response'
import { Status } from '@/types/response'
import bcrypt from 'bcryptjs'
import { successResponse } from '@/utils/response'
import { generateToken, verifyAccessToken, verifyRefreshToken } from '@/utils/jwt'
import { AuthRequest } from '@/types/auth-request'
import { Config } from '@/config/config'
import generateNumericOTP from '@/utils/generateOTP'
import emailTransporter from '@/config/email.config'

const useRepo = AppDataSource.getRepository(User)

class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body
            const isExistEmail = await useRepo.findOneBy({ email })
            if (isExistEmail) {
                return next(errorResponse(Status.BAD_REQUEST, 'This email is already used!'))
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = useRepo.create({ email, password: hashedPassword })

            if (!newUser) {
                return next(errorResponse(Status.INTERNAL_SERVER_ERROR, 'Failed to create user'))
            }

            await useRepo.save(newUser)
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

            const accessToken = await generateToken(user.id, 'access')
            const refreshToken = await generateToken(user.id, 'refresh')

            res.cookie('refresh', refreshToken, {
                maxAge: Config.cookieMaxAge,
                httpOnly: true,
                secure: false,
            })

            res.status(200).json(successResponse(Status.OK, 'Login successfully!', { accessToken }))
        } catch (err) {
            return next(err)
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
                httpOnly: true,
                secure: false,
                path: '/api/auth/refresh-token'
            })

            res.redirect(`${Config.corsOrigin}/oauth2?token=${accessToken}`)
        } catch (err) {
            res.redirect(`${Config.corsOrigin}/oauth2?token=null`)
        }
    }

    async me(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user_id = req.payload?.id
            if (!user_id) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Invalid access token'))
            }
            const user = await useRepo.findOneBy({ id: user_id })
            if (!user) {
                return next(errorResponse(Status.NOT_FOUND, 'User not found'))
            }
            return res.json(successResponse(Status.OK, 'User fetched successfully', { user }))
        }
        catch (err) {
            return next(err)
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body
            const user = await useRepo.findOneBy({ email })
            if (!user) {
                return next(errorResponse(Status.BAD_REQUEST, 'Email does not exist'))
            }

            const otp = generateNumericOTP(6)
            const resetLink = `${Config.corsOrigin}/reset-password?email=${email}&otp=${otp}`
            redisClient.setEx(`reset-${email}`, 300, otp)

            const mailOptions = {
                from: Config.emailUser,
                to: email,
                subject: 'Reset Password',
                text: `Your OTP link is ${resetLink}. This link is valid for 5 minutes.`
            }

            await emailTransporter.sendMail(mailOptions)

            return res.json(successResponse(Status.OK, 'Reset password link sent to your email'))
        } catch (err) {
            return next(err)
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp, newPassword } = req.body
            const savedOTP = await redisClient.get(`reset-${email}`)
            if (!savedOTP || Number(savedOTP) !== Number(otp)) {
                return next(errorResponse(Status.BAD_REQUEST, 'Invalid or expired OTP'))
            }
            const user = await useRepo.findOne({
                where: { email },
                select: { password: true, id: true, email: true}
            })

            if (!user) {
                return next(errorResponse(Status.BAD_REQUEST, 'Email does not exist'))
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            user.password = hashedPassword
            await useRepo.save(user)
            await redisClient.del(`reset-${email}`)
            return res.json(successResponse(Status.OK, 'Password reset successfully'))
        } catch (err) {
            return next(err)
        }
    }

    async sendVerifyEmail(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user_id = req.payload?.id
            if (!user_id) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Invalid access token'))
            }
            const user = await useRepo.findOneBy({ id: user_id })
            if (!user) {
                return next(errorResponse(Status.BAD_REQUEST, 'User does not exist'))
            }
            const otp = generateNumericOTP(6)
            const verifyEmail = `${Config.corsOrigin}/verify-email?email=${user.email}&otp=${otp}`
            redisClient.setEx(`verify-${user.id}`, 300, otp)
            const mailOptions = {
                from: Config.emailUser,
                to: user.email,
                subject: 'Verify your email',
                text: `Your verification link is ${verifyEmail}. This link is valid for 5 minutes.`
            }
            await emailTransporter.sendMail(mailOptions)
            return res.json(successResponse(Status.OK, 'Verification email sent successfully'))
        } catch (err) {
            return next(err)
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp } = req.body

            const user = await useRepo.findOneBy({ email })
            if (!user) {
                return next(errorResponse(Status.BAD_REQUEST, 'Email does not exist'))
            }
            const savedOTP = await redisClient.get(`verify-${user.id}`)


            if (!savedOTP || Number(savedOTP) !== Number(otp)) {
                return next(errorResponse(Status.BAD_REQUEST, 'Invalid or expired OTP'))
            }

            user.isActive = true
            await useRepo.save(user)
            await redisClient.del(`verify-${user.id}`)
            return res.json(successResponse(Status.OK, 'Email verified successfully'))
        }catch (err) {
            
            return next(err)
        }

    }
}

export default new AuthController()
