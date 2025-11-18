import { Permission } from './../src/entities/permission.entity'
import { DataSource } from 'typeorm'
import { Role } from '../src/entities/role.entity'

export class seedAuthorization {
    constructor(private dataSource: DataSource) {}

    async init() {
        const roleRepository = this.dataSource.getRepository(Role)
        const permissionRepository = this.dataSource.getRepository(Permission)

        // =============================
        //       Seed permmissions
        // =============================

        const permissionData = [
            // user permissions
            { name: 'user:read', description: 'Read user information' },
            { name: 'user:manage', description: 'Manage all users (admin only)' },
            { name: 'user:update', description: 'Update user information' },
            { name: 'user:delete', description: 'Delete a user' },

            // workspace permissions
            { name: 'workspace:create', description: 'Create a new workspace' },
            { name: 'workspace:read', description: 'Read workspace information' },
            { name: 'workspace:update', description: 'Update workspace information' },
            { name: 'workspace:delete', description: 'Delete a workspace' },
            { name: 'workspace:manage', description: 'Full workspace administrators' },
            { name: 'workspace:add_member', description: 'Add a member to a workspace' },
            { name: 'workspace:remove_member', description: 'Remove a member from a workspace' },
            { name: 'workspace:change_member_role', description: "Change a member's role in a workspace" },
            { name: 'workspace:read_members', description: 'Read workspace members' }
        ]

        // save permissions
        const createdPermissions: Permission[] = []
        for (const permData of permissionData) {
            let permission = await permissionRepository.findOneBy({ name: permData.name })
            if (!permission) {
                permission = permissionRepository.create({
                    name: permData.name,
                    description: permData.description
                })
                await permissionRepository.save(permission)
                console.log('Created permission: ', permData.name)
            } else {
                console.log('Permission already exists: ', permData.name)
            }
            createdPermissions.push(permission)
        }

        // =============================
        //         Seed roles
        // =============================
        const roleData = [
            { name: 'admin', description: 'Administrator with full access', permissions: createdPermissions },
            {
                name: 'workspace_admin',
                description: 'Workspace administrator with elevated access',
                permissions: createdPermissions.filter((perm) => perm.name.includes('workspace:'))
            },
            {
                name: 'user',
                description: 'Regular user with limited access',
                permissions: createdPermissions.filter(
                    (perm) =>
                        perm.name === 'user:read' ||
                        perm.name === 'user:update' ||
                        perm.name === 'workspace:read' ||
                        perm.name === 'workspace:create'
                )
            },
            {
                name: 'guest',
                description: 'Guest user with minimal access',
                permissions: createdPermissions.filter((perm) => perm.name === 'workspace:read')
            },
            {
                name: 'workspace_member',
                description: 'Workspace member with standard access',
                permissions: createdPermissions.filter(
                    (perm) =>
                        perm.name === 'workspace:read' ||
                        perm.name === 'workspace:update' ||
                        perm.name === 'workspace:read_members'
                )
            }
        ]

        // save roles
        for (const roleInfo of roleData) {
            let role = await roleRepository.findOne({
                where: { name: roleInfo.name },
                relations: ['permissions']
            })

            if (!role) {
                role = roleRepository.create({
                    name: roleInfo.name,
                    description: roleInfo.description,
                    permissions: roleInfo.permissions
                })
                await roleRepository.save(role)
                console.log(' Created role: ', roleInfo.name)
            } else {
                console.log('Role already exists: ', roleInfo.name)
                if (roleInfo.permissions) {
                    role.permissions = roleInfo.permissions
                    await roleRepository.save(role)
                    console.log(' Updated permissions for role: ', roleInfo.name)
                }
            }
        }

        console.log('Authorization seeding completed.')
    }
}
