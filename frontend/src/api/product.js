import axiosInstance from "./axiosInstance";

const getProducts = async () => {
    const response = await axiosInstance.get("/projects");
    return response.data.projects;
};

const productService = {
    getProducts
};

export default productService;
