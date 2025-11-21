import { upload } from './../../middleware/upload';
import { NextFunction, Response, Request } from 'express'
import { errorResponse, successResponse } from '@/utils/response'
import { Status } from '@/types/response'
import UserRepository from './user.repository'
import { AuthRequest } from '@/types/auth-request';

class UserController {
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await UserRepository.findAll()
            return res.json(successResponse(Status.OK, 'Users fetched successfully', users))
        } catch (err) {
            next(err)
        }
    }

    getUserByID = async (req: Request, res: Response, next: NextFunction) =>    {
        try {
            const { id } = req.params
            const user = await UserRepository.findById(id)
            if (user) {
                res.json(successResponse(Status.OK, 'User fetched successfully', user))
            } else {
                res.status(Status.NOT_FOUND).json(errorResponse(Status.NOT_FOUND, 'User not found'))
            }
        } catch (err) {
            next(err)
        }
    }

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, email, password } = req.body
            await UserRepository.createUser({ username, email, password })
            return res.json(successResponse(Status.CREATED, 'Create new user successfully!'))
        } catch (err) {
            next(err)
        }
    }

    uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            // if (!user) {
            //     return res.status(Status.UNAUTHORIZED).json(errorResponse(Status.UNAUTHORIZED, 'Unauthorized'))
            // }
            const file = req.file;
            if (!file) {
                return res.status(Status.BAD_REQUEST).json(errorResponse(Status.BAD_REQUEST, 'No file uploaded'))
            }
            console.log('Uploaded file info:', file);

            return res.json(successResponse(Status.OK, 'Avatar uploaded successfully', { avatarUrl: file.path }))   

        }   
        catch(err){}
    }

}

export default new UserController()
