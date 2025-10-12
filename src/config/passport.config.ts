import GoogleStrategy from 'passport-google-oauth20';
import passport from 'passport';
import { Config } from '../config/config';

passport.use(new GoogleStrategy.Strategy({
    clientID: Config.googleClientID,
    clientSecret: Config.googleClientSecret,
    callbackURL: Config.googleRedirectURI,
},
function(accessToken, refreshToken, profile, cb){
    
}))