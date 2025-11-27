import { Role } from '@/entities/role.entity';
import { PermissionDTO } from './../permission/permission.dto';

export class RoleDTOForRelation {
    id: number
    name: string
    constructor(id: number, name: string) {
        this.id = id
        this.name = name
    }
}

export class RoleDTO {
    id: string
    name: string
    description: string
    permissions: PermissionDTO[]
    createdAt: Date
    updatedAt: Date
    constructor(role: Role) {
        this.id = role.id
        this.name = role.name
        this.description = role.description
        this.permissions = role.permissions.map((permission => new PermissionDTO(permission)))
        this.createdAt = role.createdAt
        this.updatedAt = role.updatedAt
    }
}