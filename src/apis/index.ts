import UserRoute from '@/apis/users/users.route'
import { Router } from 'express'

const route = Router()

route.use('/users', UserRoute)

export default  route