import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
    table: {
        type: Number,
        unique: true
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    orders: [{
        product: String,
        count: {
            type: Number,
            default: 1
        },
        isServed: {
            type: Boolean,
            default: false
        }
    }],
    check: {
        type: Boolean,
        default: false
    }
});

const Table = mongoose.model('Table', tableSchema);

export default Table;