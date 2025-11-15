import { createClient } from 'redis'

const redisClient = createClient()

redisClient.on('error', (err) => console.error('Failed to connect redis: ', err))
;(async () => {
    await redisClient.connect()
    console.log('Connected to Redis')
})()

export default redisClient
