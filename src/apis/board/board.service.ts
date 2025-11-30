import BoardRepository from './board.repository'
import { CreateBoardDto } from './board.dto'
import { Status } from '@/types/response'

export class BoardService {
    async getPublicBoards() {
        const boards = await BoardRepository.getPublicBoards()
        return {
            status: Status.OK,
            message: 'Public boards retrieved successfully',
            data: boards
        }
    }

    async getAllBoards(userId: string) {
        const boards = await BoardRepository.getAllBoardsForUser(userId)
        return {
            status: Status.OK,
            message: 'Boards retrieved successfully',
            data: boards
        }
    }

    async getBoardById(boardId: string, userId: string) {
        try {
            const board = await BoardRepository.getBoardDetail(boardId, userId)
            if (!board) throw new Error('Board not found')
            return {
                status: Status.OK,
                message: 'Board retrieved successfully',
                data: board
            }
        } catch (error: any) {
            if (error.message === 'Permission denied') {
                throw { status: Status.FORBIDDEN, message: 'You do not have permission to access this board' }
            }
            throw { status: Status.NOT_FOUND, message: 'Board not found' }
        }
    }

    async createBoard(data: CreateBoardDto, userId: string) {
        try {
            const board = await BoardRepository.createBoard(
                {
                    title: data.title,
                    description: data.description,
                    permissionLevel: data.permissionLevel,
                    backgroundPath: data.backgroundUrl
                },
                data.workspaceId,
                userId
            )
            return {
                status: Status.CREATED,
                message: 'Board created successfully',
                data: board
            }
        } catch (error: any) {
            throw { status: Status.BAD_REQUEST, message: error.message }
        }
    }
}