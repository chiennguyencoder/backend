import AppDataSource from '@/config/db';
import { NextFunction, Response, Request } from 'express';
import { User } from '@/entity/user.entity';
import { errorResponse, successResponse } from '@/utils/response';
import { Status } from '@/types/response';

const userRepo = AppDataSource.getRepository(User)

class UserController {
    async getAll(req : Request, res : Response, next: NextFunction){
        try {
            const users = await userRepo.find();
            return res.json(successResponse(Status.OK, 'Users fetched successfully', users))
        }
        catch(err){
            next(err)
        }
    }

    async getUserByID(req : Request, res : Response, next: NextFunction){
        try {   
            const { id } = req.params
            const user = await userRepo.findOneBy({id})
            if (user){
                 res.json(successResponse(Status.OK, 'User fetched successfully', user));
            }
            else {
                res.status(Status.NOT_FOUND).json(errorResponse(Status.NOT_FOUND, 'User not found'))
            }
        }catch(err){
            next(err)
        }
    }

    async createUser(req : Request, res : Response, next: NextFunction){
        try {
            const { username, email, password } = req.body
            const user = userRepo.create({username, email, password})
            await userRepo.save(user)
            return res.json(successResponse(Status.CREATED, 'Create new user successfully!'))
        }
        catch(err){
            next(err)
        }
    }
}

export default new UserController()