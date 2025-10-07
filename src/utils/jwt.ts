import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from 'dotenv'
import redisClient from '@/config/redis.config';
import { AuthRequest } from '@/types/auth-request';
import { NextFunction, Response } from 'express';
import { errorResponse } from './response';
import { Status } from '@/types/response';
import ms, { StringValue } from 'ms';

config();

export const generateToken = async ( user_id: string, type: 'access' | 'refresh' = 'access' ): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = { user_id };
        const secret =
            type === 'access'
                ? process.env.ACCESS_TOKEN_SECRET
                : process.env.REFRESH_TOKEN_SECRET;
        const expiresIn: string =
            type === 'access'
                ? process.env.ACCESS_TOKEN_EXPIRES_IN
                : process.env.REFRESH_TOKEN_EXPIRES_IN;

        if (!secret || !expiresIn) {
            return reject(new Error('Missing JWT secret or expiration'));
        }

        const options: SignOptions = { expiresIn };

        jwt.sign(payload, secret, options, async (err: Error, token: string) => {
            if (err) return reject(err);
            if (token) {
                const expiresInMs = ms(expiresIn as StringValue);
                const expiresInSeconds = Math.floor(expiresInMs / 1000);
                await redisClient.set(`${user_id}-${type}`, token, { EX : expiresInSeconds })
                return resolve(token);
            } else {
                return reject(new Error('Failed to generate token'));
            }
        });
    });
}

export const verifyAccessToken = async (req: AuthRequest, res: Response, next : NextFunction) => {
    try {
        if (!req.headers['authorization']){
            return next(errorResponse(Status.UNAUTHORIZED, 'Unauthorized!'))
        }

        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error: any, payload: any)=> {
            if (error){
                if (error.name === "TokenExpiredError"){
                    return next(errorResponse(Status.UNAUTHORIZED, 'Access Token Expired'))
                }
    
                return next(errorResponse(Status.UNAUTHORIZED, 'Invalid Access Token'))
            }

            req.payload = payload as { user_id : string}
        })

        const redisToken = await redisClient.get(`${req.payload?.user_id}-access`)
        if (redisToken !== token){
            return next(errorResponse(Status.UNAUTHORIZED, 'Invalid Access Token'))
        }

        next()

    }catch(err){
        next(errorResponse(Status.UNAUTHORIZED, 'Invalid access token'))
    }

}

export const verifyRefreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.cookies.refreshToken) {
            return next(errorResponse(Status.UNAUTHORIZED, 'Unauthorized'));
        }

        const token = req.cookies.refreshToken;

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err: any, payload: any) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return next(errorResponse(Status.UNAUTHORIZED, 'Refresh Token Expired'));
                }

                return next(errorResponse(Status.UNAUTHORIZED, 'Invalid Refresh Token'));
            }

            req.payload = payload as { user_id: string };
        });

        const redisToken = await redisClient.get(`${req.payload?.user_id}-refresh`);
        if (redisToken !== token) {
            return next(errorResponse(Status.UNAUTHORIZED, 'Invalid Refresh Token'));
        }

        return next();
    } catch (error) {
        return next(error);
    }
};