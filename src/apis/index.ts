import UserRoute from '@/apis/users/users.route'
import AuthRoute from '@/apis/auth/auth.route'
import WorkspaceRoute from '@/apis/workspace/workspace.route'
import HealthCheck from '@/apis/healthcheck/index'
import BoardRoute from '@/apis/board/board.route'
import { Router } from 'express'

const route = Router()

route.use('/users', UserRoute)
route.use('/auth', AuthRoute)
route.use('/workspaces', WorkspaceRoute)
route.use('/health', HealthCheck)
route.use('/boards', BoardRoute)
export default route
