import {Schema, model, SchemaTypes} from 'mongoose';

const OrderSchema = new Schema({

    orderCode: String, 
    product: {
        type: SchemaTypes.ObjectId,
        ref: 'products',
    },
    quantity: Number,
    totalAmount: Number,
    accountId: String,
    paymentStatus: String,  // pending, paid, failed
    customer:{
        name: String,
        email: String,
        phone: String,
        address: String,
    }
});

const OrderModel = model('orders', OrderSchema);

export default OrderModel;
