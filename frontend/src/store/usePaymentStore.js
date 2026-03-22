import { create } from "zustand";
import { purchaseApi as paymentService } from "../api/express";

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
            const data = await paymentService.getMyPurchases();
            set({ orders: data.purchases || data.orders || data || [] });
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    },

    processPayment: async (product, user, onSuccess) => {
        set({ isProcessing: true });
        try {
            // 1. Create order on backend
            const responseData = await paymentService.createOrder(product._id, product.price);
            const orderData = responseData.order || responseData;
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
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            projectId: product._id,
                            amount: product.price
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
