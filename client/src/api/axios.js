import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Uncomment when authentication is added
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Modify config before request is sent (e.g., attach tokens)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors here (e.g., 401 Unauthorized)
    return Promise.reject(error);
  }
);

export default api;
