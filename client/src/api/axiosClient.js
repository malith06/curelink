import axiosLib from 'axios';

const axiosClient = axiosLib.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for global error handling
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout if token is expired or unauthorized
      localStorage.removeItem('token');
      // Could dispatch a custom event here that AuthContext listens to,
      // or simply let the user be redirected when AuthContext state updates or on reload
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
