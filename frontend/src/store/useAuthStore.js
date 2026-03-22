import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/express';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Set authentication
      setAuth: (user, token) => {
        localStorage.setItem('authToken', token);
        set({ user, token, isAuthenticated: true });
      },

      // Login
      login: async (credentials) => {
        try {
          const response = await authApi.login(credentials);
          if (response.success) {
            get().setAuth(response.user, response.token);
            return { success: true, user: response.user };
          }
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.message || 'Login failed' 
          };
        }
      },

      // Register
      register: async (userData) => {
        try {
          const response = await authApi.register(userData);
          if (response.success) {
            get().setAuth(response.user, response.token);
            return { success: true, user: response.user };
          }
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.message || 'Registration failed' 
          };
        }
      },

      // Register as seller
      registerSeller: async (userData) => {
        try {
          const response = await authApi.registerSeller(userData);
          if (response.success) {
            get().setAuth(response.user, response.token);
            return { success: true, user: response.user };
          }
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.message || 'Registration failed' 
          };
        }
      },

      // Logout
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        localStorage.removeItem('authToken');
        set({ user: null, token: null, isAuthenticated: false });
      },

      // Load user from token
      getProfile: async () => {
        try {
          const response = await authApi.getProfile();
          if (response.success) {
            set({ user: response.user, isAuthenticated: true });
            return response.user;
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          get().logout();
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        try {
          const response = await authApi.updateProfile(profileData);
          if (response.success) {
            set({ user: response.user });
            return { success: true, user: response.user };
          }
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.message || 'Update failed' 
          };
        }
      },

      // Clear auth state (on token expiry)
      clearAuth: () => {
        localStorage.removeItem('authToken');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
