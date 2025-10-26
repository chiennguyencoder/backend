import { createClient } from 'redis'
import dotenv from 'dotenv'
dotenv.config()

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redisClient.on('error', (err) => console.error('Failed to connect redis: ', err));

(async () => {
    await redisClient.connect();
    console.log('Connected to Redis')
})();

export default redisClient