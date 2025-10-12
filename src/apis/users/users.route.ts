import UserController from "./user.controller";
import { Router } from "express";

const route = Router()

route.route('/:id')
    .get(UserController.getUserByID)


route.post('/', UserController.createUser)

//TODO GET /me
//TODO DELETE /:id

export default route