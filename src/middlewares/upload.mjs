import multer from 'multer';
import { v2 as cloudinary } from "cloudinary";

const storage = multer.memoryStorage();
const uploadImage = multer({ storage });

const uploadToCloudinary = async (fileBuffer) => {
    const result = await cloudinary.uploader.upload(
        `data:image/png;base64,${fileBuffer.toString('base64')}`
    );
    return result.secure_url;
};

const upload = async (req, res, next) => {
    uploadImage.single('image')(req, res, async (err) => {
        if (err) {
            console.log("Yükleme hatası:", err);
            return next(err);
        }

        try {
            if (req.file && req.body.existingImageUrl) {
                await deleteFromCloudinary(req.body.existingImageUrl);
            }

            if (req.file) {
                const imageUrl = await uploadToCloudinary(req.file.buffer);
                req.imageUrl = imageUrl;
            }

            next();
        } catch (uploadError) {
            console.log("Cloudinary yükleme hatası:", uploadError);
            return next(uploadError);
        }
    });
};

export default upload;
