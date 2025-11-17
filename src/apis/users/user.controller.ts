import { NextFunction, Response, Request } from 'express';
import { errorResponse, successResponse } from '@/utils/response';
import { Status } from '@/types/response';
import { AuthRequest } from '@/types/auth-request';
import { UserRepository } from './user.repository'; 
import { CreateUserInput, UpdateUserInput } from './user.schema';
import bcrypt from 'bcryptjs';
import { User } from '@/entities/user.entity';

const userRepo = new UserRepository()

class UserController {
    // ... (Các hàm getAll, getMe, getUserByID giữ nguyên)
    async getAll(req : Request, res : Response, next: NextFunction){
        try {
            const users = await userRepo.findAll();
            // @ts-ignore
            users.forEach(user => delete user.password);
            return res.json(successResponse(Status.OK, 'Users fetched successfully', users))
        }
        catch(err){
            next(err)
        }
    }

    async getMe(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.payload?.user_id;
            if (!userId) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'));
            }
            
            const user = await userRepo.findById(userId);
            if (!user) {
                return next(errorResponse(Status.NOT_FOUND, 'User not found'));
            }
            // @ts-ignore
            delete user.password;
            return res.json(successResponse(Status.OK, 'Profile fetched successfully', user));
        } catch(err) {
            next(err);
        }
    }

    async getUserByID(req : Request, res : Response, next: NextFunction){
        try {   
            const { id } = req.params
            const user = await userRepo.findById(id)
            if (user){
                 // @ts-ignore
                 delete user.password;
                 res.json(successResponse(Status.OK, 'User fetched successfully', user));
            }
            else {
                res.status(Status.NOT_FOUND).json(errorResponse(Status.NOT_FOUND, 'User not found'))
            }
        }catch(err){
            next(err)
        }
    }

    // ... (Hàm createUser giữ nguyên)
    async createUser(req : Request, res : Response, next: NextFunction){
        try {
            const input = req.body as CreateUserInput;
            const isExistEmail = await userRepo.findByEmailAsync(input.email);
            if (isExistEmail) {
                return next(errorResponse(Status.BAD_REQUEST, 'This email is already used!'));
            }
            const hashedPassword = await bcrypt.hash(input.password, 10);
            const user = await userRepo.createUser({
                ...input,
                password: hashedPassword,
            });
            // @ts-ignore
            delete user.password;
            return res.status(Status.CREATED).json(successResponse(Status.CREATED, 'Create new user successfully!', user));
        }
        catch(err){
            next(err)
        }
    }

async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const input = req.body as UpdateUserInput;

            const user = await userRepo.findById(id);
            if (!user) {
                return next(errorResponse(Status.NOT_FOUND, 'User not found'));
            }

            // Logic: Kiểm tra xem có thay đổi gì không
            let hasChange = false;
            
            // so sánh input.username với user.name
            if (input.username && input.username !== user.name) hasChange = true;
            if (input.bio && input.bio !== user.bio) hasChange = true;
            if (input.isActive !== undefined && input.isActive !== user.isActive) hasChange = true;

            if (!hasChange) {
                // Yêu cầu: msg: No changed detected
                return res.status(Status.OK).json(successResponse(Status.OK, 'No changed detected', user));
            }

            // Chuẩn bị dữ liệu update (map username -> name)
            const updateData: Partial<User> = {
                ...input,
                name: input.username || user.name // Nếu có username mới thì dùng, ko thì giữ cũ
            };
            // Xóa field username thừa vì DB không có cột này
            // @ts-ignore
            delete updateData.username;

            // Thực hiện update
            const updatedUser = await userRepo.updateUser(id, updateData);
            // @ts-ignore
            delete updatedUser?.password;

            return res.json(successResponse(Status.OK, 'User updated successfully', updatedUser));

        } catch (err) {
            next(err);
        }
    }
    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await userRepo.findById(id);
            
            if (!user) {
                return next(errorResponse(Status.NOT_FOUND, 'User not found'));
            }
            
            await userRepo.deleteUser(id);
            return res.json(successResponse(Status.OK, 'User deleted successfully'));
        } catch(err) {
            next(err);
        }
    }

    async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.payload?.user_id
            if (!userId) {
                return next(errorResponse(Status.UNAUTHORIZED, 'Authentication required'))
            }
            if (!req.file) {
                return next(errorResponse(Status.BAD_REQUEST, 'No file uploaded'))
            }
            const avatarUrl = req.file.path 
            const updatedUser = await userRepo.updateAvatar(userId, avatarUrl)
            return res.json(successResponse(Status.OK, 'Avatar uploaded successfully', {
                avatarUrl: updatedUser?.avatarUrl
            }))
        } catch (err) {
            next(err)
        }
    }
}

export default new UserController()