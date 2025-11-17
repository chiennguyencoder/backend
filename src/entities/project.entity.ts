// src/entities/project.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { DateTimeEntity } from './base/DateTimeEntity';
import { Board } from './board.entity';
import { ProjectMembers } from './project-member.entity';
import { User } from './user.entity';

@Entity('projects')
export class Project extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 255 })
  public title: string;

  @Column({ type: 'varchar', nullable: true })
  public description: string;

  @Column({ type: 'boolean', default: false, name: 'is_archived' })
  public isArchived: boolean;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  public owner: User;

  @OneToMany(() => ProjectMembers, (projectMember) => projectMember.user)
  public projectMembers: ProjectMembers[];

  @OneToMany(() => Board, (board) => board.project)
  boards: Board[];
}