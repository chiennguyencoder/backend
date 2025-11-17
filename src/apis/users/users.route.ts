import UserController from './user.controller'
import { Router, RequestHandler } from 'express' 
import { createApiResponse } from '@/api-docs/openApiResponseBuilder'
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { upload } from '@/middleware/upload'; 
import { verifyAccessToken } from '@/utils/jwt';
import { Status } from '@/types/response';
import { requireRole } from '@/middleware/authorization'; 
import { CreateUserSchema, UserResponseSchema, UsersResponseSchema, UpdateUserSchema } from './user.schema';
import { validateHandle } from '@/middleware/validate-handle';

const route = Router()
export const userRegistry = new OpenAPIRegistry()

const AvatarUploadResponseSchema = z.object({
  avatarUrl: z.string().url(),
})

const ParamsSchema = z.object({
  id: z.string().uuid(),
});

const registerPath = () => {
    userRegistry.registerPath({
        method: 'get',
        path: '/api/users',
        tags: ['Users'],
        summary: 'Get all users (Admin only)',
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(UsersResponseSchema, 'Users fetched successfully'),
    })

    userRegistry.registerPath({
        method: 'post',
        path: '/api/users',
        tags: ['Users'],
        summary: 'Create a new user (Admin only)',
        security: [{ bearerAuth: [] }],
        request: { body: { content: { 'application/json': { schema: CreateUserSchema }}}},
        responses: createApiResponse(UserResponseSchema, 'User created successfully', Status.CREATED),
    })

    userRegistry.registerPath({
        method: 'get',
        path: '/api/users/me',
        tags: ['Users'],
        summary: 'Get current logged in user info (Owner only)',
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(UserResponseSchema, 'Profile fetched successfully'),
    })

    userRegistry.registerPath({
        method: 'post',
        path: '/api/users/me/avatar',
        tags: ['Users'],
        summary: 'Upload or change user avatar (Owner only)',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Avatar file to upload to Cloudinary',
                content: {
                    'multipart/form-data': {
                        schema: z.object({
                            avatar: z.string().openapi({ format: 'binary' }),
                        }),
                    },
                },
            },
        },
        responses: createApiResponse(AvatarUploadResponseSchema, 'Avatar uploaded successfully', Status.OK),
    })

    userRegistry.registerPath({
        method: 'put',
        path: '/api/users/{id}',
        tags: ['Users'],
        summary: 'Update user profile (Admin only)',
        security: [{ bearerAuth: [] }],
        request: { 
            params: ParamsSchema,
            body: { content: { 'application/json': { schema: UpdateUserSchema }}}
        },
        responses: createApiResponse(UserResponseSchema, 'User updated successfully'),
    })

    userRegistry.registerPath({
        method: 'get',
        path: '/api/users/{id}',
        tags: ['Users'],
        summary: 'Get user by id (Admin only)',
        security: [{ bearerAuth: [] }],
        request: { params: ParamsSchema },
        responses: createApiResponse(UserResponseSchema, 'User fetched successfully'),
    })
    
    userRegistry.registerPath({
        method: 'delete',
        path: '/api/users/{id}',
        tags: ['Users'],
        summary: 'Delete a user (Admin only)',
        security: [{ bearerAuth: [] }],
        request: { params: ParamsSchema },
        responses: createApiResponse(z.null(), 'User deleted successfully'),
    })
}

registerPath()

route.use(verifyAccessToken);

// Owner Routes
route.get('/me', UserController.getMe);
route.post('/me/avatar', upload, UserController.uploadAvatar);

// Admin Routes
route.use(requireRole(['admin']) as RequestHandler); 

route.get('/', UserController.getAll);
route.post('/', validateHandle(CreateUserSchema), UserController.createUser);
route.get('/:id', UserController.getUserByID);
route.put('/:id', validateHandle(UpdateUserSchema), UserController.updateUser);
route.delete('/:id', UserController.deleteUser);

export default route