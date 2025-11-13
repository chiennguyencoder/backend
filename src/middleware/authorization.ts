import { Role } from './../entities/role.entity'
import { Permission } from './../entities/permission.entity'
import { User } from '@/entities/user.entity'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import AppDataSource from '@/config/typeorm.config'
import { WorkspaceMembers } from '@/entities/workspace-member.entity'
import { errorResponse } from '@/utils/response'
import { Status } from '@/types/response'
import { AuthenticatedRequest, AuthRequest } from '@/types/auth-request'

export const loadUserPermission = async (userId: string) => {
    try {
        const userRepository = AppDataSource.getRepository(User)
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ['role', 'role.permissions']
        })

        if (!user || !user.role) return null
        const roles = user.role.map((role) => role.name)
        const permissions = user.role.flatMap((role) =>
            role.permissions ? role.permissions.map((permission) => permission.name) : []
        )

        const uniquePermissions = [...new Set(permissions)]
        return {
            roles,
            uniquePermissions
        }
    } catch (err) {
        return null
    }
}

export const authorizePermission = (requiredPermissions: string | string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user
            if (!user){
                return next(errorResponse(Status.NOT_FOUND, 'User not found'))
            }
            const userPermissions = await loadUserPermission(user.id as string)
            if (!userPermissions){
                return next(errorResponse(Status.FORBIDDEN, 'Permission denied'))
            }
            user.roles = userPermissions.roles
            user.permissions = userPermissions.uniquePermissions

            const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
            const hasPermission = permissions.every((perm) => userPermissions?.uniquePermissions.includes(perm));

            if (!hasPermission) {
                return next(errorResponse(Status.FORBIDDEN, 'Permission denied'))
            }
            
            next()
        } catch (err) {
            return next(errorResponse(Status.FORBIDDEN, 'Permission denied'))
        }
    }
}

export const authorizePermissionWorkspace = (requiredPermission: string | string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            if (!user){
                return next(errorResponse(Status.NOT_FOUND, 'User not found'))
            }

            const workspaceId = req.params.id;
            const workspaceMemberRepository = AppDataSource.getRepository(WorkspaceMembers);
            const membership = await workspaceMemberRepository.findOne({
                where: {
                    workspace: { id: workspaceId },
                    user: { id: user.id }
                },
                relations: ['role', 'role.permissions']
            });
            if (!membership) {
                return next(errorResponse(Status.NOT_FOUND, 'Membership not found'))
            }

            const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
            const hasPermission = permissions.every((perm) => membership.role.permissions.some((p) => p.name === perm));

            if (!hasPermission) {
                return next(errorResponse(Status.FORBIDDEN, 'Permission denied'))
            }

            next()
        }
        catch(err){
            return next(errorResponse(Status.FORBIDDEN, 'Permission denied'))
        }
    }
}
