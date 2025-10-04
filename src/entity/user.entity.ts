import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { GenerateDate } from './base/GenerateDate'

@Entity('users')
export class User extends GenerateDate {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type: 'varchar', length : 50})
    username: string

    @Column({type: 'varchar'})
    password : string

    @Column({type : 'varchar', length : 100 })
    email : string
}
