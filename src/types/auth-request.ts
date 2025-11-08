import { Request } from "express";

export interface AuthRequest extends Request {
    payload? : {
        id : string
    }
}

export interface AuthenticatedRequest extends Request {
    user : {
        id : string
        [key: string]: any
    },
    workspacePermissions?: {
        role :string | null,
        permissions : string[],
        isMember : boolean
    }

}

