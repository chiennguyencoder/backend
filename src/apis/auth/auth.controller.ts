import { Request, Response, NextFunction } from "express";
import AppDataSource from '@/config/typeorm.config';
import { User } from '@/entities/user.entity';
import { errorResponse } from "@/utils/response";
import { Status } from "@/types/response";
import bcrypt from 'bcryptjs';
import { successResponse } from "@/utils/response";
import { generateToken, verifyAccessToken, verifyRefreshToken } from "@/utils/jwt";
import { AuthRequest } from "@/types/auth-request";
import { LoginInput } from "./auth.validate";


const useRepo = AppDataSource.getRepository(User)

class AuthController {
    async register(req: Request, res: Response, next: NextFunction){
        try {
            const { email, password } = req.body
            const isExistEmail = await useRepo.findOneBy({email})
            if(isExistEmail){
                return next(errorResponse(Status.BAD_REQUEST, 'This email is already used!'))
            }

            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = useRepo.create({email, password: hashedPassword})

            if (!newUser) {
                return next(errorResponse(Status.INTERNAL_SERVER_ERROR, 'Failed to create user'))
            }

            await useRepo.save(newUser)
            return res.json({message: 'Register successfully!'})
        }   
        catch(err){
            return next(err)
        }
    }

    async login(req: Request, res: Response, next: NextFunction){
        try {
            const { email, password } = req.body

            const user = await useRepo.findOneBy({email})
            if(!user){
                return next(errorResponse(Status.BAD_REQUEST, 'Invalid email'))
            }

            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) {
                return next(errorResponse(Status.BAD_REQUEST, 'Email or password is incorrect!'))
            }

            const accessToken = await generateToken(user.id, 'access')
            const refreshToken = await generateToken(user.id, 'refresh')
            return res.json({message: 'Login successfully!', accessToken, refreshToken})
        }
        catch(err){
            return next(err)
        }
    }

    async refreshToken(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const user_id = req.payload?.user_id
            if (!user_id) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Invalid access token'))
            }
            const accessToken = await generateToken(user_id, 'access')
            return res.json(successResponse(Status.OK,'Generate access token successfully!', { accessToken }))
        }
        catch(err){
            return next(errorResponse(Status.UNAUTHORIZED, 'Invalid refresh token'))
        }
    }
}

export default new AuthController()