import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { DateTimeEntity } from './base/DateTimeEntity'
import { Workspace } from './workspace.entity'
import { User } from './user.entity'
import { Role } from './role.entity'

@Entity('workspace_members')
export class WorkspaceMembers extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column({ type: 'enum', enum: ['accepted', 'rejected', 'pending'], default: 'pending' })
    public status: 'accepted' | 'rejected' | 'pending'

    @ManyToOne(() => Role, (role) => role.workspaceMembers)
    public role: Role

    @ManyToOne(() => User, (user) => user.workspaceMembers)
    public user: User

    @ManyToOne(() => Workspace, (workspace) => workspace.workspaceMembers, {
        onDelete: 'CASCADE'
    })
    public workspace: Workspace
}
