import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { DateTimeEntity } from './base/DateTimeEntity';
import { Board } from './board.entity';
import { WorkspaceMembers } from './workspace-member.entity';

@Entity('workspaces')
export class Workspace extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 255 })
  public title: string;

  @Column({ type: 'varchar', nullable: true })
  public description: string;

  @OneToMany(() => WorkspaceMembers, (projectMember) => projectMember.user)
  public workspaceMembers: WorkspaceMembers[];

  @OneToMany(() => Board, (board) => board.workspace)
  boards: Board[];
}