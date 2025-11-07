import { Workspace } from '../../entities/workspace.entity';
import { WorkspaceMembers } from '../../entities/workspace-member.entity';
import { User } from '@/entities/user.entity';
import { Role } from '@/entities/role.entity';
import AppDataSource from '@/config/typeorm.config'

export class WorkspaceRepository {
    private workspaceRepo = AppDataSource.getRepository(Workspace)
    private workspaceMemberRepo = AppDataSource.getRepository(WorkspaceMembers);
    private userRepo = AppDataSource.getRepository(User);
    private roleRepo = AppDataSource.getRepository(Role);

    async findAll(): Promise<Workspace[]> {
        return this.workspaceRepo.find()
    }

    async findById(id: string): Promise<Workspace | null> {
        return this.workspaceRepo.findOne({ where: { id } })
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

    async addMemberToWorkspace(workspaceId: string, userId: string, roleName: string): Promise<void> {
        const workspace = await this.workspaceRepo.findOne({
            where: { id: workspaceId },
            relations: ['workspaceMembers'],
        });
        if (!workspace) {
            throw new Error('Workspace not found');
        }

        const existingMember = workspace.workspaceMembers.find(
            (member) => member.user.id === userId
        );
        if (existingMember) {
            throw new Error('User is already a member of the workspace');
        }

        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }
        const role = await this.roleRepo.findOneBy({ name: roleName });
        if (!role) {
            throw new Error('Role not found');
        }
        const newMember = this.workspaceMemberRepo.create({
            workspace: workspace,
            user: user!,
            role: role,
        });

        await this.workspaceMemberRepo.save(newMember);
    }
}