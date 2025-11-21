import { usersRegisterPath } from './users.swagger'
import UserController from './user.controller'
import { Router } from 'express'

const route = Router()

usersRegisterPath()
route.route('/').get(UserController.getAll).post(UserController.createUser)
route.route('/:id').get(UserController.getUserByID)

export default route
