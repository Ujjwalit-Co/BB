import axiosInstance from "./axiosInstance";

const createOrder = async (productId) => {
    const response = await axiosInstance.post("/payments/create-order", { productId });
    return response.data;
};

const verifyPayment = async (paymentData) => {
    const response = await axiosInstance.post("/payments/verify-payment", paymentData);
    return response.data;
};

const getMyOrders = async () => {
    const response = await axiosInstance.get("/payments/my-orders");
    return response.data;
};

const paymentService = {
    createOrder,
    verifyPayment,
    getMyOrders
};

export default paymentService;
