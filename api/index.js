import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';

const app = express();

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: process.env.CORS_METHODS,
    allowedHeaders: process.env.CORS_HEADERS,
    credentials: true
}));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

import getRoutes from '../src/routes/getRoutes.mjs';
import postRoutes from '../src/routes/postRoutes.mjs';
import putRoutes from '../src/routes/putRoutes.mjs';
import deleteRoutes from '../src/routes/deleteRoutes.mjs';

app.use(getRoutes);
app.use(postRoutes);
app.use(putRoutes);
app.use(deleteRoutes);

(async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {
            maxPoolSize: 10
        });
        console.log("MongoDB bağlantısı sağlandı!");
    } catch (err) {
        console.log(err);
    }
})();

export default app;