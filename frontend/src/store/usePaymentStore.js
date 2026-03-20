import { create } from "zustand";
import paymentService from "../api/payment";

const usePaymentStore = create((set, get) => ({
    isProcessing: false,
    checkoutModalOpen: false,
    currentProduct: null,
    orders: [],

    setCheckoutModalOpen: (isOpen, product = null) => set({
        checkoutModalOpen: isOpen,
        currentProduct: product
    }),

    fetchMyOrders: async () => {
        try {
            const data = await paymentService.getMyOrders();
            set({ orders: data.orders || [] });
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    },

    processPayment: async (product, user, onSuccess) => {
        set({ isProcessing: true });
        try {
            // 1. Create order on backend
            const orderData = await paymentService.createOrder(product._id);
            console.log("Order created on backend:", orderData);

            // 2. Open Razorpay Checkout widget
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "BrainBazaar",
                description: `Purchase ${product.title}`,
                order_id: orderData.id,
                handler: async function (response) {
                    console.log("Razorpay response received:", response);
                    // 3. Verify payment on backend
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            productId: product._id
                        };
                        console.log("Sending verification data:", verifyData);
                        const result = await paymentService.verifyPayment(verifyData);
                        console.log("Verification result:", result);
                        set({ isProcessing: false, checkoutModalOpen: false });
                        if (onSuccess) onSuccess(result);
                    } catch (verifyError) {
                        console.error("Payment Verification Failed", verifyError);
                        set({ isProcessing: false });
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user?.name || "Guest User",
                    email: user?.email || "guest@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#6366f1" // indigo-500
                }
            };
            
            const rzp = new window.Razorpay(options);
            
            rzp.on("payment.failed", function (response) {
                console.error("Payment Failed", response.error);
                set({ isProcessing: false });
                alert(response.error.description);
            });

            rzp.open();
        } catch (error) {
            console.error("Error processing payment:", error);
            set({ isProcessing: false });
            alert("Could not initiate payment. Please try again.");
        }
    }
}));

export default usePaymentStore;
