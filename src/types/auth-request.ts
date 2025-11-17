import { Request } from "express";

export interface AuthRequest extends Request {
    payload? : {
        user_id : string
    }
}