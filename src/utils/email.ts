import transporter from '@/config/email.config';

export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify?token=${token}`;

    await transporter.sendMail({
        from: `"MyApp" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your email',
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`
    });
};

export const sendTokenToResetPassword = async( email: string, token: string) =>{
    // const resetLink =  `${process.env.BASE_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
        from: `"MyApp" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your email to reset password',
        // html: `<p>Click <a href="${resetLink}">here</a> to verify your email to reset password</p>`
        html: `<p>Here is your reset password token: ${token}`
    })

}