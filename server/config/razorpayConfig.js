import RazorPay from 'razorpay';
import { config } from 'dotenv';
config();

const razorpay = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default razorpay;
