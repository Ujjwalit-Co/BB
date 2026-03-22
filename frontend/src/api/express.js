import axios from 'axios';

const EXPRESS_API_URL = import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1';

/**
 * Axios instance for Express backend
 */
const axiosInstance = axios.create({
  baseURL: EXPRESS_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────
export const authApi = {
  login: async (credentials) => {
    const { data } = await axiosInstance.post('/auth/login', credentials);
    return data;
  },

  register: async (userData) => {
    const { data } = await axiosInstance.post('/auth/register', userData);
    return data;
  },

  registerSeller: async (userData) => {
    const { data } = await axiosInstance.post('/auth/register-seller', userData);
    return data;
  },

  getProfile: async () => {
    const { data } = await axiosInstance.get('/auth/me');
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await axiosInstance.put('/auth/me', profileData);
    return data;
  },

  logout: async () => {
    const { data } = await axiosInstance.post('/auth/logout');
    return data;
  },
};

// ─── Projects API (Express) ───────────────────────────────
export const projectsExpressApi = {
  // Public
  getAll: async (filters) => {
    const { data } = await axiosInstance.get('/projects', { params: filters });
    return data;
  },
  getById: async (id) => {
    const { data } = await axiosInstance.get(`/projects/${id}`);
    return data;
  },
  
  // Seller
  upload: async (projectData) => {
    const { data } = await axiosInstance.post('/projects', projectData);
    return data;
  },
  getSellerProjects: async () => {
    const { data } = await axiosInstance.get('/projects/seller/my-projects');
    return data;
  },
  generateAI: async (projectData) => {
    const { data } = await axiosInstance.post('/projects/generate-ai', projectData);
    return data;
  },
  download: async (projectId) => {
    const { data } = await axiosInstance.get(`/projects/${projectId}/download`, {
      responseType: 'blob'
    });
    return data;
  },
  submitForReview: async (projectId) => {
    const { data } = await axiosInstance.post(`/projects/${projectId}/submit-review`);
    return data;
  },
  updateProject: async (projectId, updates) => {
    const { data } = await axiosInstance.put(`/projects/${projectId}`, updates);
    return data;
  },
  deleteProject: async (projectId) => {
    const { data } = await axiosInstance.delete(`/projects/${projectId}`);
    return data;
  },
};

// ─── Purchase API ─────────────────────────────────────────
export const purchaseApi = {
  createOrder: async (projectId, amount) => {
    const { data } = await axiosInstance.post('/purchases/order', { projectId, amount });
    return data;
  },

  verifyPayment: async (paymentData) => {
    const { data } = await axiosInstance.post('/purchases/verify', paymentData);
    return data;
  },

  getMyPurchases: async () => {
    const { data } = await axiosInstance.get('/purchases/my-purchases');
    return data;
  },

  getSellerSales: async () => {
    const { data } = await axiosInstance.get('/purchases/seller/sales');
    return data;
  },
};

// ─── Progress API ─────────────────────────────────────────
export const progressApi = {
  startTrial: async (projectId) => {
    const { data } = await axiosInstance.post('/progress/start', { projectId });
    return data;
  },

  getProgress: async (projectId) => {
    const { data } = await axiosInstance.get(`/progress/${projectId}`);
    return data;
  },

  saveProgress: async (projectId, progressData) => {
    const { data } = await axiosInstance.put(`/progress/${projectId}`, progressData);
    return data;
  },

  completeStep: async (projectId, milestoneIndex, stepIndex) => {
    const { data } = await axiosInstance.post(`/progress/${projectId}/complete-step`, {
      milestoneIndex,
      stepIndex,
    });
    return data;
  },

  checkTrialStatus: async (projectId) => {
    const { data } = await axiosInstance.get(`/progress/${projectId}/trial-status`);
    return data;
  },
};

// ─── GitHub API ───────────────────────────────────────────
export const githubApi = {
  connect: () => {
    window.location.href = `${EXPRESS_API_URL}/github/connect`;
  },

  disconnect: async () => {
    const { data } = await axiosInstance.post('/github/disconnect');
    return data;
  },

  getRepositories: async () => {
    const { data } = await axiosInstance.get('/github/repositories');
    return data;
  },
};

// ─── Admin API ────────────────────────────────────────────
export const adminApi = {
  getPendingProjects: async () => {
    const { data } = await axiosInstance.get('/admin/pending-projects');
    return data;
  },

  approveProject: async (projectId) => {
    const { data } = await axiosInstance.post(`/admin/${projectId}/approve`);
    return data;
  },

  declineProject: async (projectId, notes) => {
    const { data } = await axiosInstance.post(`/admin/${projectId}/decline`, { notes });
    return data;
  },

  requestChanges: async (projectId, notes) => {
    const { data } = await axiosInstance.post(`/admin/${projectId}/request-changes`, { notes });
    return data;
  },

  getStats: async () => {
    const { data } = await axiosInstance.get('/admin/stats');
    return data;
  },

  getAllProjects: async () => {
    const { data } = await axiosInstance.get('/admin/all-projects');
    return data;
  },
};

// ─── Credit API ───────────────────────────────────────────
export const creditsApi = {
  getBalance: async () => {
    const { data } = await axiosInstance.get('/credits/balance');
    return data;
  },

  purchaseCredits: async (packId) => {
    const { data } = await axiosInstance.post('/credits/purchase', { packId });
    return data;
  },

  consumeCredits: async (amount, description, projectId) => {
    const { data } = await axiosInstance.post('/credits/consume', { amount, description, projectId });
    return data;
  },

  getHistory: async () => {
    const { data } = await axiosInstance.get('/credits/history');
    return data;
  },

  unlockMilestone: async (projectId, milestoneIndex) => {
    const { data } = await axiosInstance.post('/credits/unlock-milestone', { projectId, milestoneIndex });
    return data;
  },
};

export default axiosInstance;
