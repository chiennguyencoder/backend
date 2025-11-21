import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '@/config/cloundinary'

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const folderPath = 'avatars/'
        const fileExtension = file.originalname.split('.').pop();
        const publicId = `${file.fieldname}-${req.user?.id}`;
        return {
            folder: folderPath,
            format: fileExtension,
            public_id: publicId,
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
        };
    }
})


export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
})
