import { Permissions } from './../../enums/permissions.enum'
import WorkspaceController from './workspace.controller'
import { Router } from 'express'
import { verifyAccessToken } from '@/utils/jwt'
import { InvitationResponseSchema, WorkspaceSchema } from './workspace.schema'
import { validateHandle } from '@/middleware/validate-handle'
import { authorizePermission, authorizePermissionWorkspace } from '@/middleware/authorization'
import { registerPath } from './workspace.swagger'

const router = Router()

registerPath()

router
    .route('/')
    .get(verifyAccessToken, authorizePermission(Permissions.READ_WORKSPACE), WorkspaceController.getAllWorkspaces)
    .post(
        verifyAccessToken,
        authorizePermission(Permissions.CREATE_WORKSPACE),
        validateHandle(WorkspaceSchema),
        WorkspaceController.createWorkspace
    )


router
    .route('/invitations')
    .get(
        verifyAccessToken,
        WorkspaceController.getAllInvitations
    )

router 
    .route('/invitations/:workspaceId')
    .post(
        verifyAccessToken,
        validateHandle(InvitationResponseSchema),
        WorkspaceController.respondToInvitation
    )



router
    .route('/:id')
    .delete(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.DELETE_WORKSPACE),
        WorkspaceController.deleteWorkspace
    )
    .put(
        verifyAccessToken,
        validateHandle(WorkspaceSchema),
        authorizePermissionWorkspace(Permissions.UPDATE_WORKSPACE),
        WorkspaceController.updateWorkspace
    )
    .get(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.READ_WORKSPACE),
        WorkspaceController.getWorkspaceByID
    )

router
    .route('/:workspaceId/archive')
    .post(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.MANAGE_WORKSPACE_PERMISSIONS),
        WorkspaceController.archiveWorkspace
    )

router.route('/:workspaceId/unarchive')
    .post(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.MANAGE_WORKSPACE_PERMISSIONS),
        WorkspaceController.reopenWorkspace
    )

router
    .route('/:workspaceId/members')
    .get(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.READ_WORKSPACE_MEMBERS),
        WorkspaceController.getWorkspaceMembers
    )
    .post(
        verifyAccessToken,
        validateHandle(WorkspaceSchema),
        authorizePermissionWorkspace(Permissions.ADD_MEMBER_TO_WORKSPACE),
        WorkspaceController.addMemberToWorkspace
    )
    .delete(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.REMOVE_MEMBER_FROM_WORKSPACE),
        WorkspaceController.removeMemberFromWorkspace
    )
router
    .route('/:workspaceId/members/:memberId/role')
    .put(
        verifyAccessToken,
        authorizePermissionWorkspace(Permissions.MANAGE_WORKSPACE_PERMISSIONS),
        WorkspaceController.changeMemberRole
    )

export default router
