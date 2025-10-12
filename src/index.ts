import 'reflect-metadata'
import AppDataSource from '@/config/typeorm.config'
import express, { urlencoded } from 'express'
import { ErrorHandler } from './middleware/error-handle'
import { setupSwagger } from './config/swagger.config'
import AppRoute from './apis/index'
import cors from 'cors'
import { url } from 'inspector'
import passport from 'passport'
import { Config } from './config/config'
import session from 'express-session'
import './config/passport.config'
import { openAPIRouter } from "@/api-docs/openApiRouter";


// Create Express app

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())
app.use(urlencoded({ extended: true }))

// Session and Passport
app.use(
    session({
        secret: Config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: Config.cookieMaxAge }
    })
)

app.use(passport.initialize())
app.use(passport.session())


// Connect database
AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!')
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err)
    })

// Swagger

app.use(openAPIRouter)

app.use('/api', AppRoute)
app.use((req, res, next) => {
    res.status(404).json({
        success : false,
        msg : "NOT FOUND"
    })
})
// Error Handler
app.use(ErrorHandler)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
