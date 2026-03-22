import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      setAuth: (user, token) => {
        set({ user, token });
      },
      
      logout: () => {
        set({ user: null, token: null });
      },
      
      setUser: (user) => set({ user }),
      
      getProfile: async () => {
        try {
          const authData = JSON.parse(localStorage.getItem('auth-storage'));
          const token = authData?.state?.token;
          if (!token) return;

          const { data } = await import('axios').then(m => m.default.get(
            `${import.meta.env.VITE_BACKEND_URL}/user/me`,
            { headers: { Authorization: `Bearer ${token}` } }
          ));
          
          if (data.success) {
            set({ user: data.user });
            return data.user;
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      }
    }),
    {
      name: 'auth-storage', // unique name for the storage
    }
  )
);

export default useAuthStore;
