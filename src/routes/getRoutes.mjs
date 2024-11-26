import { Router } from "express";
import Product from "../models/product.mjs";
// import Admin from "../models/admin.mjs";
import Table from "../models/table.mjs";

const router = Router();

router.get('/category/:slug/product/:productSlug', async (req, res) => {
    try {
        const category = await Product.findOne({ slug: req.params.slug });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const product = category.products.find(p => p.slug === req.params.productSlug);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);

    } catch (err) {
        console.log('Error:', err);
        return res.status(500).send(`Bir sorun oluştu: ${err}`);
    }
})

router.get('/category/:slug', async (req, res) => {
    try {
        const products = await Product.findOne({ slug: req.params.slug });

        if (!products || products.length <= 0) {
            console.log('not found');
            return res.status(404).send('Not found.')
        }

        return res.send(products);

    } catch (err) {
        console.log('Error:', err);
        return res.status(500).send(`Bir sorun oluştu: ${err}`);
    }
});

router.get('/categories', async (req, res) => {
    // const tableId = req.query.tableId;
    try {
        const categories = await Product.find().select('category slug image -_id');
        // const table = await Table.findOne({ table: tableId });

        // const response = {
        //     products,
        //     checkExists: table && table.totalAmount && table.totalAmount > 0 ? true : false
        // }

        res.send(categories);

    } catch (err) {
        console.log(err)
        return res.status(500).send('Bir sorun oluştu: ', err);
    }
});

router.get('/tables', async (req, res) => {
    try {
        const tables = await Table.find();
        res.send(tables);

    } catch (err) {
        console.log(err);
        res.status(500).send('Problem: ', err);
    }
});

router.get('/check', async (req, res) => {
    try {
        const check = await Table.findOne({ table: req.query.tableId }).select('-_id');
        res.send(check);

    } catch (err) {
        console.log(err)
        res.status(500).send('Bir sorun oluştu: ', err);
    }
});

router.get('/orders/:table', async (req, res) => {
    const orders = await Table.findOne({ table: req.params.table });
    res.send(orders);
})

router.get('/orders', async (req, res) => {
    const orders = await Table.find();
    res.send(orders);
});

export default router;