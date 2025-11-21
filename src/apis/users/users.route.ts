import { usersRegisterPath } from './users.swagger'
import UserController from './user.controller'
import { Router } from 'express'
import { upload } from '@/middleware/upload'
import { verifyAccessToken } from '@/utils/jwt'

const route = Router()

usersRegisterPath()
route.route('/').get(UserController.getAll).post(UserController.createUser)
route.route('/:id').get(UserController.getUserByID)
route.route('/avatar').post(verifyAccessToken, upload.single('avatar'), UserController.uploadAvatar)
export default route
