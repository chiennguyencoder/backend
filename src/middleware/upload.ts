import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import { Config } from '@/config/config'

cloudinary.config({
    cloud_name: Config.cloudinaryCloudName,
    api_key: Config.cloudinaryApiKey,
    api_secret: Config.cloudinaryApiSecret
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // @ts-ignore
        return {
            folder: 'trello_avatars',
            public_id: `${file.fieldname}-${Date.now()}`,
            format: 'png' 
        }
    }
})

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        // @ts-ignore
        cb(new Error('Invalid file type. Only JPEG, PNG, or GIF allowed.'), false)
    }
}

export const upload = multer({
    storage: storage, 
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 
    }
}).single('avatar')
