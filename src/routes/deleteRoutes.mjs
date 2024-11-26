import { Router } from "express";
import Product from "../models/product.mjs";
import Table from "../models/table.mjs";
import auth from "../middlewares/auth.mjs";
import { v2 as cloudinary } from "cloudinary";

const router = Router();

const deleteFromCloudinary = async (imageUrl) => {
    const regex = /\/upload\/v\d+\/(.+?)\./;
    const matches = imageUrl.match(regex);

    if (!matches || matches.length < 2) {
        throw new Error('Geçersiz Cloudinary URL\'si');
    }

    const publicId = matches[1];
    console.log("Görselin public_id'si: ", publicId);

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'not found') {
            console.error("Cloudinary üzerinde görsel bulunamadı.");
        } else {
            console.log('Görsel başarıyla silindi:', result);
        }
    } catch (err) {
        console.error('Görsel silme hatası:', err);
        throw new Error('Cloudinary görsel silme hatası');
    }
};

router.delete('/delete/category/:slug', auth, async (req, res) => {
    try {
        const category = await Product.findOneAndDelete({ slug: req.params.slug });
        await deleteFromCloudinary(category.image);
        res.send(category);

    } catch (err) {
        console.log(err)
        return res.status(500).send('Bir sorun oluştu: ', err);
    }
});

router.delete('/delete/product/:slug', async (req, res) => {
    try {
        const product = await Product.updateOne(
            { 'products.slug': req.params.slug },
            { $pull: { products: { slug: req.params.slug } } }
        );
        res.send(product);

    } catch (err) {
        console.log(err)
        return res.status(500).send('Bir sorun oluştu: ', err);
    }
});

router.delete('/delete/table/:id', async (req, res) => {
    try {
        const table = await Table.deleteOne({ table: req.params.slug });
        res.send(table);

    } catch (err) {
        console.log(err)
        return res.status(500).send('Bir sorun oluştu: ', err);
    }
});

export default router;