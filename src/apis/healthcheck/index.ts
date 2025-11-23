import { Router } from 'express'
const router = Router()

//swagger documentation for health check endpoint



router.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Health check successful' })
});

export default router
