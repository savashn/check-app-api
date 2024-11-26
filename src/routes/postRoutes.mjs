import { Router } from "express";
import Product from "../models/product.mjs";
import Admin from "../models/admin.mjs";
import Table from "../models/table.mjs";
import slugify from "slugify";
import jwt from "jsonwebtoken";
import auth from "../middlewares/auth.mjs";
// import multer from 'multer';
// import { v2 as cloudinary } from "cloudinary";
import upload from "../middlewares/upload.mjs";

const router = Router();

// const uploadToCloudinary = async (fileBuffer) => {
//     const result = await cloudinary.uploader
//         .upload(
//             `data:image/png;base64,${fileBuffer.toString('base64')}`
//         );

//     return result.secure_url;
// }

// const storage = multer.memoryStorage();
// const upload = multer({ storage }).single('image');


router.post('/add/category', upload, async (req, res) => {
    try {

        if (!req.body.category) {
            return res.status(400).send({ error: 'Category field is required.' });
        }

        if (!req.file) {
            return res.status(400).send({ error: 'Image file could not uploaded.' });
        }

        const slug = slugify(req.body.category.toLowerCase());

        console.log("Generated slug:", slug);

        if (!slug || slug === "null" || slug === "undefined") {
            return res.status(400).send({ error: 'Slug could not be generated.' });
        }

        // const imageUrl = await uploadToCloudinary(req.file.buffer);

        const category = new Product({
            category: req.body.category,
            // image: imageUrl,
            image: req.imageUrl,
            slug: slug
        });

        await category.save();
        res.send(category)

    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Bir sorun oluştu', err });
    }
});

router.post('/add/table', auth, async (req, res) => {
    try {
        const table = new Table({ table: req.body.table })

        await table.save();
        return res.send(table)

    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Bir sorun oluştu', err });
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await Admin.findOne({ username: req.body.username, password: req.body.password });

        if (!user) {
            return res.status(404).send('User not found.')
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        return res.send(token);

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Bir sorun oluştu', err });
    }
});

router.post('/register', async (req, res) => {
    try {
        const user = new Admin({
            username: req.body.username,
            password: req.body.password
        });

        await user.save();
        return res.send(user);

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Something went wrong!', err });
    }
});

export default router;