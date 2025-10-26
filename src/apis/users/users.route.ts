import UserController from './user.controller'
import { Router } from 'express'
import { createApiResponse } from '@/api-docs/openApiResponseBuilder'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { PostRegister } from '../auth/auth.schema'
extendZodWithOpenApi(z)

const route = Router()
export const userRegistry = new OpenAPIRegistry()

const registerPath = () => {
    userRegistry.registerPath({
        method: 'get',
        path: '/api/users',
        tags: ['Users'],
        responses: {
            200: {
                description: 'Get all users'
            }
        }
    })

    userRegistry.registerPath({
        method: 'get',
        path: '/api/users/{id}',
        tags: ['Users'],
        request: {
            params: z.object({
                id: z.string().openapi({ example: 'cc7a10e2-df5e-4974-8a5c-df541cdc2a17' })
            })
        },
        responses: {
            200: {
                description: 'Get user by id'
            }
        }
    })

    userRegistry.registerPath({
        method: 'post',
        path: '/api/users',
        tags: ['Users'],
        request: { body: PostRegister },
        responses: createApiResponse(z.null(), 'Success')
    })
}

registerPath()
route.route('/').get(UserController.getAll).post(UserController.createUser)

route.route('/:id').get(UserController.getUserByID)

//TODO GET /me
//TODO DELETE /:id

export default route
