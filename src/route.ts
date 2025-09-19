import { Router, Request, Response } from "express";
import { pool } from "./db";

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lấy danh sách Users
 *     tags: 
 *      - GET USER
 *     responses:
 *       200:
 *         description: Danh sách users
 */
router.get("/users", async (req: Request, res: Response) => {
    try {
        const user = await pool.query('SELECT id, name, email, created_at FROM users')
        res.status(200).json(user.rows)
    } catch(err){
        res.status(500).json({err})
    }
});
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Lấy user theo id
 *     tags: 
 *       - GET USER
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của user
 *     responses:
 *       200:
 *         description: User theo id
 */
router.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err });
  }
});

export default router;
