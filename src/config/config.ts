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
};

export const Config : ConfigTypes = {
    dbUsername : process.env.DB_USERNAME || "",
    dbPassword: process.env.DB_PASSWORD || "",
    dbName: process.env.DB_DATABASE || "",
    dbHost: process.env.DB_HOST || "",
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "",
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "",
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "",
    emailPass: process.env.SMTP_PASS || "",
    emailUser: process.env.SMTP_USER || "",
    googleClientID: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    googleRedirectURI: process.env.GOOGLE_REDIRECT_URI || "",
    cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE || "604800000"),
    sessionSecret: process.env.SESSION_SECRET || "",
    corsOrigin: process.env.CORS_ORIGIN || "localhost:5173"
};