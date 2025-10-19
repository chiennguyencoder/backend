import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DateTimeEntity } from './base/DateTimeEntity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';

@Entity('workspace_members')
export class WorkspaceMembers extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'int' })
  public role: number;

  @ManyToOne(() => User, (user) => user.workspaceMembers)
  public user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceMembers)
  public workspace: Workspace;
}