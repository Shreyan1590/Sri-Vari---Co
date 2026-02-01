import axios from 'axios';

// Replace with your actual hosted backend URL (e.g., https://api.srivariandco.com)
const PRODUCTION_API_URL = 'https://sri-vari-co.onrender.com/api';
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : PRODUCTION_API_URL;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============ AUTH API ============
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me')
};

// ============ MOBILES API ============
export const mobilesAPI = {
    getAll: (params) => api.get('/mobiles', { params }),
    getById: (id) => api.get(`/mobiles/${id}`),
    add: (data) => api.post('/mobiles', data),
    update: (id, data) => api.put(`/mobiles/${id}`, data),
    sell: (id, data) => api.put(`/mobiles/${id}/sell`, data),
    delete: (id) => api.delete(`/mobiles/${id}`)
};

// ============ ANALYTICS API ============
export const analyticsAPI = {
    getSummary: () => api.get('/analytics/summary'),
    getMonthly: (year) => api.get('/analytics/monthly', { params: { year } }),
    getDaily: (month, year) => api.get('/analytics/daily', { params: { month, year } })
};

export default api;
