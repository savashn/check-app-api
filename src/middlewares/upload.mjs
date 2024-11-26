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

// const deleteFromCloudinary = async (imageUrl) => {
//     try {
//         if (!imageUrl) return;

//         const parts = imageUrl.split('/');
//         const fileNameWithExtension = parts.pop();
//         const fileName = fileNameWithExtension.split('.')[0];
//         const publicId = `${parts.pop()}/${fileName}`;

//         console.log("Silme işlemi için public ID:", publicId);  // Log public ID

//         const result = await cloudinary.uploader.destroy(publicId);
//         console.log("Cloudinary silme sonucu:", result);  // Log Cloudinary sonucu
//     } catch (err) {
//         console.error("Cloudinary'den resim silme hatası:", err);
//     }
// };

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
