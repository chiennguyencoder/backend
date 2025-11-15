import { Workspace } from '../../entities/workspace.entity'
import { WorkspaceMembers } from '../../entities/workspace-member.entity'
import { User } from '@/entities/user.entity'
import { Role } from '@/entities/role.entity'
import AppDataSource from '@/config/typeorm.config'

export class WorkspaceRepository {
    private workspaceRepo = AppDataSource.getRepository(Workspace)
    private workspaceMemberRepo = AppDataSource.getRepository(WorkspaceMembers)
    private userRepo = AppDataSource.getRepository(User)
    private roleRepo = AppDataSource.getRepository(Role)

    async findAll(): Promise<Workspace[]> {
        return this.workspaceRepo.find()
    }

    async findById(id: string): Promise<Workspace | null> {
        return this.workspaceRepo.findOne({ where: { id } })
    }

    async findWithMembersById(id: string): Promise<Workspace | null> {
        return this.workspaceRepo.findOne({
            where: { id },
            relations: ['workspaceMembers', 'workspaceMembers.user', 'workspaceMembers.role']
        })
    }

    async createWorkspace(data: Partial<Workspace>): Promise<Workspace> {
        const workspace = this.workspaceRepo.create(data)
        return this.workspaceRepo.save(workspace)
    }

    async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace | null> {
        await this.workspaceRepo.update(id, data)
        return this.findById(id)
    }

    async deleteWorkspace(id: string): Promise<void> {
        await this.workspaceRepo.delete(id)
    }

    async findWorkspaceBy(query: Partial<Workspace>) {
        return this.workspaceRepo.findOneBy(query)
    }

    async assignRoleWorkspace(userId: string, workspaceId: string, roleName: string): Promise<void> {
        const user: User | null = await this.userRepo.findOne({ where: { id: userId } })
        const workspace: Workspace | null = await this.workspaceRepo.findOne({ where: { id: workspaceId } })
        const role: Role | null = await this.roleRepo.findOne({ where: { name: roleName } })

        console.log(user, workspace, role)

        if (!user || !workspace || !role) {
            throw new Error('Invalid user, workspace or role')
        }

        const workspaceMember = this.workspaceMemberRepo.create({
            user: user!,
            workspace: workspace!,
            role: role!
        })
        await this.workspaceMemberRepo.save(workspaceMember)
    }

    async removeMemberFromWorkspace(userId: string, workspaceId: string): Promise<void> {
        await this.workspaceMemberRepo.delete({ user: { id: userId }, workspace: { id: workspaceId } })
    }

    async changeMemberRole(memberId: string, workspaceId: string, roleId: string): Promise<void> {
        await this.workspaceMemberRepo.update(
            { user: { id: memberId }, workspace: { id: workspaceId } },
            { role: { id: roleId } }
        )
    }
}
