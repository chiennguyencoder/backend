import { AvatarUpload } from './../../middleware/upload'
import { usersRegisterPath } from './users.swagger'
import UserController from './user.controller'
import { Router } from 'express'
import { verifyAccessToken } from '@/utils/jwt'
import { validateHandle } from '@/middleware/validate-handle'
import { UpdateUserRequest, CreateUserSchema } from './user.schema'
const route = Router()

usersRegisterPath()
route.route('/').get(UserController.getAll).post(validateHandle(CreateUserSchema), UserController.createUser)
route.route('/:id').get(UserController.getUserByID).patch(validateHandle(UpdateUserRequest), UserController.updateUser)
route.route('/avatar').post(verifyAccessToken, AvatarUpload.single('avatar'), UserController.uploadAvatar)
route.route('/:id').delete(UserController.removeUser)

export default route
