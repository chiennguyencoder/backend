import { boardsRegisterPath } from './board.swagger'
import BoardController from './board.controller'
import { Router } from 'express'
import { verifyAccessToken } from '@/utils/jwt'
import { validateHandle } from '@/middleware/validate-handle'
import { authorizePermission, authorizePermissionWorkspace } from '@/middleware/authorization'
import {
    inviteByEmailSchema,
    acceptInviteSchema,
    joinViaShareLinkSchema,
    createShareLinkSchema,
    revokeShareLinkSchema
} from './board.schema'
import { Permissions } from './../../enums/permissions.enum'

const route = Router()

boardsRegisterPath()
route.post(
    '/:boardId/invite/email',
    verifyAccessToken,
    // authorizePermission(Permissions.ADD_MEMBER_TO_BOARD),
    validateHandle(inviteByEmailSchema),
    BoardController.inviteByEmail.bind(BoardController)
)
route.get('/accept-invite', verifyAccessToken, validateHandle(acceptInviteSchema), BoardController.acceptInvitation)
route.post('/:boardId/invite/link', validateHandle(createShareLinkSchema), BoardController.createShareLink)
route.get('/join', verifyAccessToken, validateHandle(joinViaShareLinkSchema), BoardController.joinViaShareLink)
// route.post('/revoke-link', verifyAccessToken, validateHandle(revokeShareLinkSchema), BoardController.revokeShareLink)
route.patch(
    '/:boardId/members/:userId/role',
    verifyAccessToken,
    // authorizePermission(Permissions.CHANGE_BOARD_PERMISSION_LEVEL),
    BoardController.updateMemeberRole
)
route.delete(
    '/:boardId/members/:userId',
    verifyAccessToken,
    // authorizePermission(Permissions.REMOVE_MEMBER_FROM_BOARD),
    BoardController.removeMember
)

export default route
