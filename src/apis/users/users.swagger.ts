import { createApiResponse } from '@/api-docs/openApiResponseBuilder'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { PostRegister } from '../auth/auth.schema'
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
extendZodWithOpenApi(z)

export const userRegistry = new OpenAPIRegistry()

export const usersRegisterPath = () => {
    userRegistry.registerPath({
        method: 'get',
        path: '/api/users',
        tags: ['Users'],
        summary: 'Get all users',
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
        summary: 'Get user by id',
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
        summary: 'Register new user [only admin]',
        request: { body: PostRegister },
        responses: createApiResponse(z.null(), 'Success')
    })
}
