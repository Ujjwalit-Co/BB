import { projectsApi } from "./fastapi";

/**
 * Product Service - Fetch projects from FastAPI backend
 */
const getProducts = async () => {
    const response = await projectsApi.listProjects();
    return response;
};

const getProductById = async (projectId) => {
    const response = await projectsApi.getProject(projectId);
    return response;
};

const getProductOverview = async (projectId) => {
    const response = await projectsApi.getProjectOverview(projectId);
    return response;
};

const productService = {
    getProducts,
    getProductById,
    getProductOverview
};

export default productService;
