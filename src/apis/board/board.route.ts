import { boardsRegisterPath } from './board.swagger'
import boardController from './board.controller' 
import { BoardUpload } from '@/middleware/upload'
import { Router } from 'express'
import { verifyAccessToken } from '@/utils/jwt'
import { validateHandle } from '@/middleware/validate-handle'
import { authorizeBoardPermission, authorizePermissionWorkspace } from '@/middleware/authorization'
import { 
    CreateBoardSchema, 
    inviteByEmailSchema, 
    acceptInviteSchema, 
    UpdateBoardRequest 
} from './board.schema'
import { Permissions } from './../../enums/permissions.enum'

const route = Router()

boardsRegisterPath()


// Create Board & Get All Boards
route.post(
    '/workspaces/:id/boards',
    verifyAccessToken,
    validateHandle(CreateBoardSchema),
    boardController.createBoard
)

route.get(
    '/workspaces/:id/boards',
    verifyAccessToken,
    boardController.getAllBoards
)

// Get Public Boards
route.get(
    '/boards/public', 
    boardController.getPublicBoards
)

// Invite via email
route.post(
    '/boards/:boardId/invite/email',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.ADD_MEMBER_TO_BOARD),
    validateHandle(inviteByEmailSchema),
    boardController.inviteByEmail.bind(boardController)
)

// Join via link
route.get('/boards/join', verifyAccessToken, validateHandle(acceptInviteSchema), boardController.joinBoard)

// Generate Share Link
route.post(
    '/boards/:boardId/invite/link',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.ADD_MEMBER_TO_BOARD),
    boardController.createShareLink
)

// Revoke Link
route.delete(
    '/boards/revoke-link',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.REVOKE_LINK),
    boardController.revokeShareLink
)

// Change Owner
route.patch(
    '/boards/:boardId/change-owner',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.UPDATE_BOARD_MEMBER_ROLE),
    boardController.changeOwner
)

// Update Member Role
route.patch(
    '/boards/:boardId/members/:userId/role',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.UPDATE_BOARD_MEMBER_ROLE),
    boardController.updateMemberRole
)

// Remove Member
route.delete(
    '/boards/:boardId/members/:userId',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.REMOVE_MEMBER_FROM_BOARD),
    boardController.removeMember
)

// Update Board Info
route.patch(
    '/boards/:boardId',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.UPDATE_BOARD),
    validateHandle(UpdateBoardRequest),
    boardController.updateBoard
)

// Archive
route.post(
    '/boards/:boardId/archive',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.MANAGE_BOARD),
    boardController.archiveBoard
)

// Reopen
route.post(
    '/boards/:boardId/reopen',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.MANAGE_BOARD),
    boardController.reopenBoard
)

// Upload Background
route.post(
    '/boards/:boardId/background',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.UPDATE_BOARD),
    BoardUpload.single('background'),
    boardController.uploadBoardBackground
)

// Delete Permanently
route.delete(
    '/boards/:boardId',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.DELETE_BOARD),
    boardController.deleteBoardPerrmanently
)

// Leave Board
route.post(
    '/boards/:boardId/leave',
    verifyAccessToken,
    authorizeBoardPermission(Permissions.READ_BOARD),
    boardController.leaveBoard
)

// Get Board Detail
route.get(
    '/boards/:id',
    verifyAccessToken,
    boardController.getBoardById
)

// Get Members
route.get(
    '/boards/:id/members',
    verifyAccessToken,
    boardController.getAllMembers
)

export default route