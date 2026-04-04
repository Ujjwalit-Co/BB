import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

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

// Request interceptor to add auth token from Zustand store
axiosInstance.interceptors.request.use(
  (config) => {
    const authState = useAuthStore.getState();
    const token = authState.token;
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
      // Clear auth state using Zustand
      useAuthStore.getState().clearAuth();
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
  enhanceReadme: async (readme) => {
    const { data } = await axiosInstance.post('/projects/enhance-readme', { readme });
    return data;
  },
  enhanceSummary: async (summary, readme) => {
    const { data } = await axiosInstance.post('/projects/enhance-summary', { summary, readme });
    return data;
  },
  enhanceMilestones: async (milestones, readme) => {
    const { data } = await axiosInstance.post('/projects/enhance-milestones', { milestones, readme });
    return data;
  },
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const { data } = await axiosInstance.post('/upload/project-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  getMilestoneQuiz: async (projectId, milestoneNumber) => {
    const { data } = await axiosInstance.get(`/projects/${projectId}/milestones/${milestoneNumber}/quiz`);
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

  askQuestion: async (projectId, payload) => {
    // payload should include: milestoneIndex, question, files, projectContext, isSandbox
    const { data } = await axiosInstance.post(`/progress/${projectId}/ask`, payload);
    return data;
  },
};

// ─── GitHub API ───────────────────────────────────────────
export const githubApi = {
  connect: async (accessLevel = 'public') => {
    try {
      const { data } = await axiosInstance.get(`/github/connect?access=${accessLevel}`);
      if (data.success && data.url) {
        window.location.href = data.url;
      }
      return data;
    } catch (error) {
      console.error("Failed to connect GitHub:", error);
      throw error;
    }
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

  createCreditOrder: async (packId) => {
    const { data } = await axiosInstance.post('/credits/order', { packId });
    return data;
  },

  verifyCreditPayment: async (paymentData) => {
    const { data } = await axiosInstance.post('/credits/verify', paymentData);
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
