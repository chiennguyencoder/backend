import GoogleStrategy from 'passport-google-oauth20'
import passport from 'passport'
import { Config } from '../config/config'
import UserRepository from '@/apis/users/user.repository'

passport.use(
    'google',
    new GoogleStrategy.Strategy(
        {
            clientID: Config.googleClientID,
            clientSecret: Config.googleClientSecret,
            callbackURL: Config.googleRedirectURI
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
                console.log('Google profile:', profile)
                let user = await UserRepository.findUserBy({ googleID: profile.id })
                const email = profile.emails?.[0]?.value
                if (!user) {
                    user = await UserRepository.createUser({
                        googleID: profile.id,
                        email,
                        avatarUrl: profile.photos?.[0]?.value,
                        username: profile.displayName
                    })
                }
                const payload = user
                return done(null, payload)
            } catch (err) {
                return done(err)
            }
        }
    )
)

passport.serializeUser((user: any, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await UserRepository.findById(id)
        done(null, user)
    } catch (err) {
        done(err, null)
    }
})

export default passport
