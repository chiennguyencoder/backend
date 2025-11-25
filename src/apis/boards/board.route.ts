import { Router } from 'express'
import BoardController from './board.controller'
import { verifyAccessToken } from '@/utils/jwt'
import { validateHandle } from '@/middleware/validate-handle'
import { CreateBoardSchema } from './board.schema'
import { authorizePermissionWorkspace } from '@/middleware/authorization'
import { Permissions } from '@/enums/permissions.enum'
import { boardRegisterPath } from './board.swagger'

const router = Router()

boardRegisterPath()

router.route('/workspaces/:id/boards')
  .post(
    verifyAccessToken,
    validateHandle(CreateBoardSchema),
    // authorizePermissionWorkspace(Permissions.CREATE_BOARD), 
    BoardController.createBoard
  )
  .get(
    verifyAccessToken,
    // authorizePermissionWorkspace(Permissions.READ_BOARD),
    BoardController.getAllBoards
  )

router.route('/boards/:id')
  .get(verifyAccessToken, BoardController.getBoard)

router.route('/boards/:id/members')
  .get(verifyAccessToken, BoardController.getAllMembers)

export default router