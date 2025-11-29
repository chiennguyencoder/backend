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

// Invate via email to board
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
    authorizeBoardPermission(Permissions.UPDATE_BOARD_MEMBER_ROLE),
    boardController.changeOwner
)

route.patch(
    '/:boardId/members/:userId/role',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.UPDATE_BOARD_MEMBER_ROLE),
    BoardController.updateMemberRole
)

route.delete(
    '/:boardId/members/:userId',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.REMOVE_MEMBER_FROM_BOARD),
    BoardController.removeMember
)

// Update board by id
route.patch(
    '/:boardId',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.UPDATE_BOARD),
    validateHandle(UpdateBoardRequest),
    BoardController.updateBoard
)

// Archive board by id
route.post(
    '/:boardId/archive',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.MANAGE_BOARD),
    BoardController.archiveBoard
)

// Reopen board by id
route.post(
    '/:boardId/reopen',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.MANAGE_BOARD),
    BoardController.reopenBoard
)

// Upload board background
route.post(
    '/:boardId/background',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.UPDATE_BOARD),
    BoardUpload.single('background'),
    BoardController.uploadBoardBackground
)

// Delete permanently board by id
route.delete(
    '/:boardId',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.DELETE_BOARD),
    BoardController.deleteBoardPerrmanently
)

// Leave board by id
route.post(
    '/:boardId/leave',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.READ_BOARD),
    BoardController.leaveBoard
)
export default route
