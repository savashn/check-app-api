import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    products: [{
        product: {
            type: String,
            required: true
        },
        description: String,
        stock: {
            type: Boolean,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        slug: {
            type: String,
            // unique: true
        }
    }]
});

const Product = mongoose.model('Product', productSchema);

export default Product;