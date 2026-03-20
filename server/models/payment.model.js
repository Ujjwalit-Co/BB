import {model , Schema} from 'mongoose';

const paymentSchema = new Schema({
    razorpay_payment_id:{
        type: String,
        required: true
    },
    razorpay_subscription_id:{
        type: String,
    },
    razorpay_order_id: {
        type: String,
    },
    razorpay_signature:{
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
});

const Payment = model('Payment',paymentSchema);

export default Payment;