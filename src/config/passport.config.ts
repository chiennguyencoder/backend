import GoogleStrategy from 'passport-google-oauth20'
import passport from 'passport'
import { Config } from '../config/config'
import { UserRepository } from '@/apis/users/user.repository'

passport.use(
    'google',
    new GoogleStrategy.Strategy(
        {
            clientID: Config.googleClientID,
            clientSecret: Config.googleClientSecret,
            callbackURL: Config.googleRedirectURI
        },
        async (accessToken: string, refreshToken: string, profile: any, done) => {
            try {
                const repo = new UserRepository()
                let user = await repo.findUserBy({ googleID: profile.id })
                const email = profile.emails?.[0]?.value
                if (!user) {
                    user = await repo.createUserAsync({
                        googleID: profile.id,
                        email,
                        avatarUrl: profile.photos?.[0]?.value,
                        username: profile.displayName
                    })

                    return done(null, user)
                }
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
        const repo = new UserRepository()
        const user = await repo.findById(id)
        done(null, user)
    } catch (err) {
        done(err, null)
    }
})

export default passport
