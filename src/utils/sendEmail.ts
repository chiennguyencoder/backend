import emailTransporter from '@/config/email.config'

export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify?token=${token}`

    await emailTransporter.sendMail({
        from: `"Trello" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your email',
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email to active your account</p>`
    })
}
