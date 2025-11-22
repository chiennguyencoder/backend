import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { DateTimeEntity } from './base/DateTimeEntity'
import { List } from './list.entity'
import { Workspace } from './workspace.entity'

@Entity('boards')
export class Board extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column({ type: 'varchar', length: 255 })
    public title: string

    @Column({ type: 'text', nullable: true })
    public description: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    public backgroundUrl: string

    @Column({ type: "varchar", length: 20, default: 'public' })
    public permissionLevel: 'private' | 'workspace' | 'public'

    @ManyToOne(() => Workspace, (workspace) => workspace.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspaceId' })
    public workspace: Workspace

    @OneToMany(() => List, (list) => list.board)
    lists: List[]
}
