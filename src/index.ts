import 'reflect-metadata'
import  AppDataSource  from '@/config/typeorm.config' 
import express from "express";
import { ErrorHandler } from "./middleware/error-handle";
import { setupSwagger } from "./config/swagger.config";
import  AppRoute from './apis/index'

const app = express();
const PORT = 3000;

app.use(express.json());


// Connect database
AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!')
    })
    .catch(err => {
        console.error('Error during Data Source initialization:', err)
    })

// Swagger
setupSwagger(app)

// Error Handler

app.use('/api', AppRoute)
app.use(ErrorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
