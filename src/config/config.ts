// src/config/config.ts
import { config } from 'dotenv'

config();

interface ConfigTypes {
    dbUsername: string;
    dbPassword: string;
    dbName: string;
    dbHost: string;
    accessTokenSecret: string;
    accessTokenExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
    emailPass: string;
    emailUser: string;
    googleClientID: string;
    googleClientSecret: string;
    googleRedirectURI: string;
    cookieMaxAge: number;
    sessionSecret: string;
    corsOrigin: string;
    cloudinaryCloudName: string;
    cloudinaryApiKey: string;
    cloudinaryApiSecret: string;
};

// 🔽 ĐÃ SỬA LỖI Ở DÒNG 'dbName' 🔽
export const Config : ConfigTypes = {
    dbUsername : (process.env.DB_USERNAME || "").trim(),
    dbPassword: (process.env.DB_PASSWORD || "").trim(),
    dbName: (process.env.DB_DATABASE || "").trim(), // 👈 ĐÃ XÓA KÝ TỰ '*' BỊ LỖI Ở ĐÂY
    dbHost: (process.env.DB_HOST || "").trim(),
    accessTokenSecret: (process.env.ACCESS_TOKEN_SECRET || "").trim(),
    accessTokenExpiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || "").trim(),
    refreshTokenSecret: (process.env.REFRESH_TOKEN_SECRET || "").trim(),
    refreshTokenExpiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || "").trim(),
    emailPass: (process.env.SMTP_PASS || "").trim(),
    emailUser: (process.env.SMTP_USER || "").trim(),
    googleClientID: (process.env.GOOGLE_CLIENT_ID || "").trim(),
    googleClientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
    googleRedirectURI: (process.env.GOOGLE_REDIRECT_URI || "").trim(),
    cookieMaxAge: parseInt((process.env.COOKIE_MAX_AGE || "604800000").trim()),
    sessionSecret: (process.env.SESSION_SECRET || "").trim(),
    corsOrigin: (process.env.CORS_ORIGIN || "localhost:5173").trim(),
    cloudinaryCloudName: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    cloudinaryApiKey: (process.env.CLOUDINARY_API_KEY || "").trim(),
    cloudinaryApiSecret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
};