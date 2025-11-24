import boardController from './board.controller'
import { Router } from 'express'
import { BoardUpload } from '@/middleware/upload'
import { verifyAccessToken } from '@/utils/jwt'
import { validateHandle } from '@/middleware/validate-handle'
import { UpdateBoardRequest } from './board.schema'
import { boardsRegisterPath } from './board.swagger'
const router = Router()


boardsRegisterPath()
router.post('/:boardId/archive', verifyAccessToken, boardController.archiveBoard)
router.patch('/:boardId', verifyAccessToken, validateHandle(UpdateBoardRequest), boardController.updateBoard)
router.post('/:boardId/reopen', verifyAccessToken, boardController.reopenBoard)
router.post(
    '/:boardId/background',
    verifyAccessToken,
    BoardUpload.single('background'),
    boardController.uploadBoardBackground
)

router.delete('/:boardId', verifyAccessToken, boardController.deleteBoardPerrmanently)

export default router
