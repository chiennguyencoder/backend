import { Board } from '@/entities/board.entity'
import DataSource from '@/config/typeorm.config'

class BoardRepository {
    private repo = DataSource.getRepository(Board)

    getBoardById = async (boardId: string): Promise<Board | null> => {
        return this.repo.findOne({ where: { id: boardId } })
    }
    updateBoard = async (boardId: string, updateData: Partial<Board>): Promise<Board | null> => {
        await this.repo.update(boardId, updateData)
        return this.repo.findOne({ where: { id: boardId } })
    }

    deleteBoard = async (boardId: string): Promise<void> => {
        await this.repo.delete(boardId)
    }
}


export default new BoardRepository()