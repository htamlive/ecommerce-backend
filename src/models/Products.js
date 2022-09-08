import {Schema, model} from 'mongoose';

const ProductSchema = new Schema({
    name: String,
    slug: String,
    price: Number,
    image: String,
    description: String,
});

const ProductModel = model('products', ProductSchema);

export default ProductModel;