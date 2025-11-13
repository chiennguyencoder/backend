import { NextFunction, Response, Request } from 'express';
import { errorResponse, successResponse } from '@/utils/response';
import { Status } from '@/types/response';
import UserRepository from './user.repository';

class UserController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await UserRepository.findAll()
            return res.json(successResponse(Status.OK, 'Users fetched successfully', users))
        } catch (err) {
            next(err)
        }
    }

    async getUserByID(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params
            const user = await UserRepository.findById(id)
            if (user) {
                res.json(successResponse(Status.OK, 'User fetched successfully', user));
            } else {
                res.status(Status.NOT_FOUND).json(errorResponse(Status.NOT_FOUND, 'User not found'))
            }
        } catch (err) {
            next(err)
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body
            await UserRepository.createUser({ username, email, password })
            return res.json(successResponse(Status.CREATED, 'Create new user successfully!'))
        } catch (err) {
            next(err)
        }
    }
}

export default new UserController()
