import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pp_token');
      localStorage.removeItem('pp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register  = (data) => api.post('/auth/register', data);
export const login     = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');

// Reports
export const getDailyReport  = (date)  => api.get('/reports/daily',  { params: { date } });
export const getWeeklyReport = ()      => api.get('/reports/weekly');
export const getHistory      = (days)  => api.get('/tracking/history', { params: { days } });
export const getTodayTracking = ()     => api.get('/tracking/today');

// Settings
export const getSettings     = ()      => api.get('/settings');
export const updateSettings  = (data) => api.put('/settings', data);
export const getBlockedSites = ()      => api.get('/settings/blocked-sites');
export const addBlockedSite  = (domain) => api.post('/settings/blocked-sites', { domain });
export const removeBlockedSite = (domain) => api.delete(`/settings/blocked-sites/${domain}`);

export default api;
