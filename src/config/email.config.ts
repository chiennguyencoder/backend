import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { config } from 'dotenv';
config();
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

export default nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
});
