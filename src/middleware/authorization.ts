import { User } from "@/entities/user.entity";
import { NextFunction, Request, Response } from "express";
import AppDataSource from "@/config/typeorm.config";
import { WorkspaceMembers } from "@/entities/workspace-member.entity";
import { errorResponse } from "@/utils/response";
import { Status } from "@/types/response";
import { Role } from "@/entities/role.entity";
import { Permission } from "@/entities/permission.entity";

class Authorization {
    constructor(){

    }

    async authorizePermissionWorkspace(requiredPermission: string | string[]){
        return async (req: Request, res: Response, next: NextFunction) => {
            
        }
    }
}