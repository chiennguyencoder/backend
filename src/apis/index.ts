import UserRoute from '@/apis/users/users.route'
import AuthRoute from '@/apis/auth/auth.route'
import ProjectRoute from '@/apis/project/project.route'

import { Router } from 'express'

const route = Router()

route.use('/users', UserRoute)
route.use('/auth', AuthRoute)
route.use('/project', ProjectRoute)

export default route
