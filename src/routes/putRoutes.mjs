import { Router } from "express";
import Product from "../models/product.mjs";
import Table from "../models/table.mjs";
import auth from "../middlewares/auth.mjs";
import upload from "../middlewares/upload.mjs";
import slugify from "slugify";
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

router.put('/check', async (req, res) => {
    try {
        await Table.updateOne(
            { table: req.body.tableId },
            {
                $set: {
                    check: true
                }
            }
        );

        return res.send('Hesap istendi');

    } catch (err) {
        console.log(err);
        return res.status(500).send('Bir sorun oluştu');
    }
});

router.put('/:tableId/order', async (req, res) => {
    const { tableId } = req.params;
    const { products } = req.body;

    try {
        const totalAmount = products.reduce((sum, item) => sum + item.price * item.count, 0);

        const newOrders = products.map((i) => ({
            product: i.product,
            count: i.count,
            isServed: false,
        }));

        const table = await Table.findOneAndUpdate(
            { table: tableId },
            {
                $inc: { totalAmount: totalAmount },
                $push: { orders: { $each: newOrders } }
            },
            { new: true }
        );

        if (!table) {
            return res.status(404).send('Masa bulunamadı.');
        }

        console.log('Siparişler: ', newOrders);
        console.log('Masa güncellemesi: ', table);

        res.send('Sipariş başarıyla alındı!');
    } catch (err) {
        console.error('Sipariş alma hatası:', err);
        res.status(500).send('Sipariş alma sırasında bir hata oluştu.');
    }
});

router.put('/close/:number', async (req, res) => {
    try {
        await Table.updateOne(
            { table: req.params.number },
            {
                $set: {
                    totalAmount: 0,
                    orders: []
                }
            }
        );

        console.log('Ödeme işlemi başarılı.')
        res.status(200).send('Success!');

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Bir sorun oluştu' });
    }
});

router.put('/orders/:number', async (req, res) => {
    try {
        const orderId = req.body.order;

        const updatedProduct = await Table.findOneAndUpdate(
            { table: req.params.number, 'orders._id': orderId },
            { $set: { 'orders.$.isServed': true } }
        );

        res.send(updatedProduct);

    } catch (err) {
        console.error('Düzenleme sorunu:', err);
        res.status(500).send('Düzenleme aşamasında bir sorun oluştu.');
    }
});

router.put('/category/:slug/product/:pslug', auth, async (req, res) => {
    try {
        const product = await Product.updateOne(
            { slug: req.params.slug, "products.slug": req.params.pslug },
            {
                $set: {
                    "products.$.product": req.body.product,
                    "products.$.description": req.body.description,
                    "products.$.price": req.body.price,
                    "products.$.stock": req.body.stock
                }
            }
        );

        if (product.nModified === 0) {
            return res.status(404).json({ message: "Ürün bulunamadı veya güncellenemedi." });
        }

        res.json({ message: "Ürün başarıyla güncellendi.", product });

    } catch (err) {
        console.error("Düzenleme sırasında bir sorun oluştu:", err);
        res.status(500).json({ message: "Düzenleme sırasında bir sorun oluştu.", error: err });
    }
})

router.put('/edit/category/:slug', auth, upload, async (req, res) => {
    try {
        const category = req.body.category;
        if (!category) {
            return res.status(400).json({ message: "Kategori ismi gerekli." });
        }

        const existingCategory = await Product.findOne({ slug: req.params.slug });
        if (!existingCategory) {
            return res.status(404).json({ message: "Kategori bulunamadı." });
        }

        const categoryLower = category.toLowerCase();
        const categorySlug = slugify(categoryLower);

        const image = req.imageUrl || existingCategory.image;

        if (req.imageUrl && existingCategory.image) {
            await deleteFromCloudinary(existingCategory.image);
        }

        const updateData = {
            $set: {
                category: category,
                image: image,
                slug: categorySlug,
            },
        };

        if (req.body.product) {
            updateData.$addToSet = {
                products: {
                    product: req.body.product,
                    description: req.body.description,
                    price: req.body.price,
                    stock: true,
                    slug: slugify(req.body.product)
                },
            };
        }

        await Product.updateOne({ slug: req.params.slug }, updateData);

        console.log('Kategori başarıyla güncellendi!');
        res.status(200).json({ message: "Kategori başarıyla güncellendi!" });

    } catch (err) {
        console.error("Düzenleme sırasında bir sorun oluştu:", err);
        res.status(500).json({ message: "Düzenleme sırasında bir sorun oluştu.", error: err });
    }
});


export default router;