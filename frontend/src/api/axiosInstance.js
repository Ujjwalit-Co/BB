import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5010/api/v1',
  withCredentials: true,
});

export default axiosInstance;
