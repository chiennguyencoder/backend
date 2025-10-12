// import UserRoute from '@/apis/users/users.route'
import AuthRoute from '@/apis/auth/auth.route'
import { Router } from 'express'

const route = Router()

// route.use('/users', UserRoute)
route.use('/auth', AuthRoute)

export default  route