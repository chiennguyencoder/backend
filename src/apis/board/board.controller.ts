import { upload } from './../../middleware/upload'
import { NextFunction, Response, Request } from 'express'
import { errorResponse, successResponse } from '@/utils/response'
import { Status } from '@/types/response'
import AppDataSource from '@/config/typeorm.config'
import BoardRepository from './board.repository'
import { AuthRequest } from '@/types/auth-request'
import { generateToken } from '@/utils/jwt'
import generateNumericOTP from '@/utils/generateOTP'
import { encode } from 'punycode'
import redisClient from '@/config/redis.config'
import { Config } from '@/config/config'
import { User } from '@/entities/user.entity'
import emailTransporter from '@/config/email.config'
import { Board } from '@/entities/board.entity'
import { Role } from '@/entities/role.entity'

const useRepo = AppDataSource.getRepository(User)
const roleRepo = AppDataSource.getRepository(Role)
class BoardController {
    async inviteByEmail(req: AuthRequest, res: Response, next: NextFunction) {
        const { email } = req.body
        const boardId = req.params.boardId

        if (!email) {
            return next(errorResponse(Status.BAD_REQUEST, 'Email is required'))
        }

        try {
            const isMember = await BoardRepository.findMemberByEmail(boardId, email)
            if (isMember) {
                return res.status(Status.FORBIDDEN).json(errorResponse(Status.FORBIDDEN, 'Already a member'))
            }

            await this.sendInvitationEmail(boardId, email)
            return res.status(Status.OK).json(successResponse(Status.OK, 'Invitation sent successfully'))
        } catch (err) {
            return next(err)
        }
    }

    async sendInvitationEmail(boardId: string, email: string) {
        const token = crypto.randomUUID()

        await redisClient.setEx(`invite:${token}`, 7 * 24 * 60 * 60, JSON.stringify({ boardId, email }))

        const inviteLink = `${Config.baseUrl}/api/boards/accept-invite?token=${token}`

        const mailOptions = {
            from: Config.emailUser,
            to: email,
            subject: 'Invitation to join board',
            html: `
                <p>You have been invited to join a board.</p>
                <a href="${inviteLink}">Accept Invitation</a>
            `
        }

        await emailTransporter.sendMail(mailOptions)
    }

    async acceptInvitation(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { token } = req.query
            const dataStr = await redisClient.get(`invite:${token}`)
            if (!dataStr) {
                return next(errorResponse(Status.BAD_REQUEST, 'Invalid or expired token'))
            }

            const { boardId } = JSON.parse(dataStr)

            const userId = req.user!.id

            const isMember = await BoardRepository.findMemberByUserId(boardId, userId)
            if (isMember) {
                return res.status(Status.OK).json(successResponse(Status.OK, 'Already a member of the board'))
            }

            await BoardRepository.addMemberToBoard(boardId, userId, 'board_member')

            await redisClient.del(`invite:${token}`)

            return res.status(Status.OK).json(successResponse(Status.OK, 'Successfully joined the board'))
        } catch (err) {
            next(err)
        }
    }

    async createShareLink(req: AuthRequest, res: Response, next: NextFunction) {
        const boardId = req.params.boardId
        const { maxUses, expireSeconds } = req.body

        const token = crypto.randomUUID()

        const payload = {
            boardId,
            maxUses: maxUses || null,
            usedCount: 0
        }

        await redisClient.setEx(`shareLink:${token}`, expireSeconds || 7 * 24 * 60 * 60, JSON.stringify(payload))

        const link = `${Config.baseUrl}/api/boards/join?token=${token}`
        return res.status(Status.OK).json(successResponse(Status.OK, 'Share link created', { link }))
    }

    async joinViaShareLink(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { token } = req.query
            const dataStr = await redisClient.get(`shareLink:${token}`)
            if (!dataStr) {
                return next(errorResponse(Status.BAD_REQUEST, 'Invalid or expired share link'))
            }
            const data = JSON.parse(dataStr)

            if (data.maxUses && data.usedCount >= data.maxUses) {
                return next(errorResponse(Status.BAD_REQUEST, 'Token already used maximum times'))
            }

            console.log('User ID:', req.user!.id)
            const isMember = await BoardRepository.findMemberByUserId(data.boardId, req.user!.id)
            if (isMember) {
                return res.status(Status.OK).json(successResponse(Status.OK, 'Already a member of the board'))
            }
            console.log('User ID 2 :', req.user!.id)
            await BoardRepository.addMemberToBoard(data.boardId, req.user!.id, 'board_member')

            console.log('Added user to board:', data.boardId)
            if (data.maxUses) {
                data.usedCount += 1
                await redisClient.setEx(
                    `shareLink:${token}`,
                    await redisClient.ttl(`shareLink:${token}`),
                    JSON.stringify(data)
                )
            }

            return res.status(Status.OK).json(successResponse(Status.OK, 'Successfully joined the board'))
        } catch (err) {
            next(err)
        }
    }

    async revokeShareLink(req: AuthRequest, res: Response, next: NextFunction) {
        const { token } = req.query
        await redisClient.del(`shareLink:${token}`)
        return res.status(Status.OK).json(successResponse(Status.OK, 'Share link revoked'))
    }

    async updateMemeberRole(req: AuthRequest, res: Response, next: NextFunction) {
        const { boardId, userId } = req.params
        const { roleName } = req.body
        if (!boardId || !userId || !roleName) {
            return next(errorResponse(Status.BAD_REQUEST, 'boardId, userId and roleName are required'))
        }
        try {
            const isMember = await BoardRepository.findMemberByUserId(boardId, userId)
            if (!isMember) {
                return next(errorResponse(Status.NOT_FOUND, 'User is not a member of the board'))
            }
            const newRole = await roleRepo.findOne({ where: { name: roleName } })
            if (!newRole) {
                return next(errorResponse(Status.NOT_FOUND, 'Role not found'))
            }
            await BoardRepository.updateMemberRole(boardId, userId, roleName)
            return res.status(Status.OK).json(successResponse(Status.OK, 'Member role updated successfully'))
        } catch (err) {
            return next(err)
        }
    }

    async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
        const { boardId, userId } = req.params
        try {
            const isMember = await BoardRepository.findMemberByUserId(boardId, userId)
            if (!isMember) {
                return next(errorResponse(Status.NOT_FOUND, 'User is not a member of the board'))
            }

            if (isMember.role.name === 'board_admin') {
                const owners = await BoardRepository.countOwners(boardId)
                if (owners <= 1) {
                    return next(
                        errorResponse(Status.FORBIDDEN, 'Cannot remove the last owner. Transfer ownership first.')
                    )
                }
            }

            await BoardRepository.removeMember(boardId, userId)
            return res.status(Status.OK).json(successResponse(Status.OK, 'Member removed successfully'))
        } catch (err) {
            return next(err)
        }
    }
}
export default new BoardController()
