import { z } from 'zod'
import { ZodRequestBody, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const inviteByEmailSchema = z.object({
    email: z.string().email('Invalid email address').optional()
})

export const acceptInviteSchema = z.object({
    token: z.string()
})

export const createShareLinkSchema = z.object({
    expiresIn: z.number().int().optional().openapi({
        description: 'Time to expire in minutes',
        example: 60
    }),
    maxUses: z.number().int().optional().openapi({
        description: 'Max number of times the link can be used',
        example: 5
    })
})

export const joinViaShareLinkSchema = z.object({
    token: z.string()
})

export const revokeShareLinkSchema = z.object({
    token: z.string()
})

export const updateMemberRoleSchema = z.object({
    roleName: z.string().openapi({
        description: 'Name of the role to assign to the member',
        example: 'board_admin'
    })
})


export const UpdateBoardRequest = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).nullable().optional(),
    permissionLevel: z.enum(['private', 'workspace', 'public']).optional(),
}).strict()