// import UserController from "./users.controller";
// import { Router } from "express";

// const route = Router()

// /**
//  * @swagger
//  * /users:
//  *   get:
//  *     tags:
//  *       - Users
//  *     summary: Get all users
//  *     description: Lấy tất cả users
//  *     responses:
//  *       200:
//  *         description: Lấy dữ liệu user thành công
//  *       500:
//  *         description: Lỗi server
//  */
// // route.route('/')
// //     .get(UserController.getAll)

// /**
//  * @swagger
//  * /users/{id}:
//  *   get:
//  *     tags:
//  *       - Users
//  *     summary: Get user by ID
//  *     description: Retrieve a specific user by their ID
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: Unique identifier of the user
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Thành công
//  *       404:
//  *         description: Không tìm thấy
//  *       500:
//  *         description: Lỗi server
//  */
// route.route('/:id')
//     .get(UserController.getUserByID)


// /**
//  * @swagger
//  * /users:
//  *   post:
//  *     summary: Tạo mới user
//  *     tags: 
//  *          - Users
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - username
//  *               - email
//  *               - password
//  *             properties:
//  *               username:
//  *                 type: string
//  *                 example: "Nguyen Van A"
//  *               email:
//  *                 type: string
//  *                 example: "a@gmail.com"
//  *               password:
//  *                  type : string
//  *                  example: "Abc@123"
//  *     responses:
//  *       201:
//  *         description: User created
//  */

// route.post('/', UserController.createUser)

// //TODO GET /me
// //TODO DELETE /:id

// export default route