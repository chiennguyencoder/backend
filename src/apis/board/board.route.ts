import { boardsRegisterPath } from './board.swagger'
import BoardController from './board.controller'
import { BoardUpload } from '@/middleware/upload'
import { Router } from 'express'
import { verifyAccessToken } from '@/utils/jwt'
import { validateHandle } from '@/middleware/validate-handle'
import { authorizeBoardPermission, authorizePermissionWorkspace } from '@/middleware/authorization'
import {
    inviteByEmailSchema,
    acceptInviteSchema,
    joinViaShareLinkSchema,
    revokeShareLinkSchema,
    UpdateBoardRequest
} from './board.schema'
import { Permissions } from './../../enums/permissions.enum'
import boardController from './board.controller'

const route = Router()

boardsRegisterPath()
route.post(
    '/:boardId/invite/email',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.ADD_MEMBER_TO_BOARD),
    validateHandle(inviteByEmailSchema),
    BoardController.inviteByEmail.bind(BoardController)
)
route.get('/join', verifyAccessToken, validateHandle(acceptInviteSchema), BoardController.joinBoard)

route.post(
    '/:boardId/invite/link',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.ADD_MEMBER_TO_BOARD),
    BoardController.createShareLink
)

route.delete(
    '/revoke-link',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.REVOKE_LINK),
    BoardController.revokeShareLink
)

route.patch(
    '/:boardId/change-owner',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.CHANGE_BOARD_PERMISSION_LEVEL),
    boardController.changeOwner
)

route.patch(
    '/:boardId/members/:userId/role',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.CHANGE_BOARD_PERMISSION_LEVEL),
    BoardController.updateMemberRole
)

route.delete(
    '/:boardId/members/:userId',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.REMOVE_MEMBER_FROM_BOARD),
    BoardController.removeMember
)

route.post('/:boardId/archive', verifyAccessToken, BoardController.archiveBoard)
route.patch('/:boardId', verifyAccessToken, validateHandle(UpdateBoardRequest), BoardController.updateBoard)
route.post('/:boardId/reopen', verifyAccessToken, BoardController.reopenBoard)
route.post(
    '/:boardId/background',
    verifyAccessToken,
    BoardUpload.single('background'),
    BoardController.uploadBoardBackground
)

route.delete('/:boardId', verifyAccessToken, BoardController.deleteBoardPerrmanently)
export default route
