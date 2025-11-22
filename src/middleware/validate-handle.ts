import { NextFunction, Request, Response } from 'express'
import { ZodError, ZodSchema } from 'zod'
import { errorResponse } from '../utils/response'
import { Status } from '@/types/response'

export const validateHandle = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const res = schema.safeParse(req.body)
        if (!res.success) {
            throw res.error
        }
        req.body = res.data
        next()
    } catch (err) {
        const errorMessage = `Invalid input: ${(err as ZodError).issues.map((e: any) => e.message).join(', ')}`
        next(errorResponse(Status.BAD_REQUEST, errorMessage))
    }
}
