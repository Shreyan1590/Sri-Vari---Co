import axios from 'axios';

// ============ CONFIGURATION ============
// In production on Vercel, use same-origin /api (Vercel rewrites proxy it to Workers backend)
// In dev, use localhost:5000/api directly
function getApiBaseUrl() {
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        return 'http://localhost:5000/api';
    // Same-origin: Vercel rewrites /api/* to the Workers backend (no CORS needed)
    return '/api';
}
const API_BASE_URL = getApiBaseUrl();

// Timeout and retry configuration
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// ============ NETWORK STATUS ============
let isOnline = navigator.onLine;

// Listen for online/offline events
window.addEventListener('online', () => {
    isOnline = true;
    console.log('[API] Network: Online');
});

window.addEventListener('offline', () => {
    isOnline = false;
    console.log('[API] Network: Offline');
});

// Check if network is available
export const checkNetworkStatus = () => {
    return isOnline;
};

// ============ ERROR TYPES ============
export const ErrorTypes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    DNS_ERROR: 'DNS_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Classify error type
const classifyError = (error) => {
    if (!error.response) {
        // No response - network/DNS issue
        if (error.code === 'ECONNABORTED') {
            return ErrorTypes.TIMEOUT_ERROR;
        }
        if (error.message?.includes('Network Error') ||
            error.message?.includes('ERR_NAME_NOT_RESOLVED') ||
            error.message?.includes('Failed to fetch')) {
            return ErrorTypes.DNS_ERROR;
        }
        return ErrorTypes.NETWORK_ERROR;
    }

    if (error.response.status === 401 || error.response.status === 403) {
        return ErrorTypes.AUTH_ERROR;
    }

    if (error.response.status >= 500) {
        return ErrorTypes.SERVER_ERROR;
    }

    return ErrorTypes.UNKNOWN_ERROR;
};

// ============ RETRY LOGIC ============
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async (requestFn, retries = MAX_RETRIES) => {
    try {
        return await requestFn();
    } catch (error) {
        const errorType = classifyError(error);

        // Only retry for network/DNS/timeout errors
        if (retries > 0 && [ErrorTypes.NETWORK_ERROR, ErrorTypes.DNS_ERROR, ErrorTypes.TIMEOUT_ERROR].includes(errorType)) {
            console.log(`[API] Retrying request... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
            await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1)); // Exponential backoff
            return retryRequest(requestFn, retries - 1);
        }

        throw error;
    }
};

// ============ AXIOS INSTANCE ============
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Check network status before request
        if (!isOnline) {
            const error = new Error('No network connection');
            error.code = 'OFFLINE';
            return Promise.reject(error);
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const errorType = classifyError(error);

        console.error(`[API] Error: ${errorType}`, error.message);

        // Handle auth errors
        if (errorType === ErrorTypes.AUTH_ERROR) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Attach error type for UI handling
        error.errorType = errorType;
        error.userMessage = getErrorMessage(errorType, error);

        return Promise.reject(error);
    }
);

// Get user-friendly error message
const getErrorMessage = (errorType, error) => {
    switch (errorType) {
        case ErrorTypes.NETWORK_ERROR:
        case ErrorTypes.DNS_ERROR:
            if (API_BASE_URL.includes('localhost'))
                return 'Cannot reach the backend. Is it running? Start it with: npm run backend (from project root) or run the backend on port 5000.';
            return 'Unable to connect to server. Please check your internet connection.';
        case ErrorTypes.TIMEOUT_ERROR:
            return 'Request timed out. Please try again.';
        case ErrorTypes.SERVER_ERROR:
            return 'Server error. Please try again later.';
        case ErrorTypes.AUTH_ERROR:
            return 'Authentication failed. Please login again.';
        default:
            return error.response?.data?.message || 'Something went wrong. Please try again.';
    }
};

// ============ HEALTH CHECK ============
export const checkServerHealth = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`, {
            timeout: 10000
        });
        return response.data.success;
    } catch (error) {
        console.error('[API] Health check failed:', error.message);
        return false;
    }
};

// ============ AUTH API ============
export const authAPI = {
    register: (data) => retryRequest(() => api.post('/auth/register', data)),
    login: (data) => retryRequest(() => api.post('/auth/login', data)),
    getMe: () => retryRequest(() => api.get('/auth/me'))
};

// ============ MOBILES API ============
export const mobilesAPI = {
    getAll: (params) => retryRequest(() => api.get('/mobiles', { params })),
    getById: (id) => retryRequest(() => api.get(`/mobiles/${id}`)),
    add: (data) => api.post('/mobiles', data), // No retry for mutations
    update: (id, data) => api.put(`/mobiles/${id}`, data),
    sell: (id, data) => api.put(`/mobiles/${id}/sell`, data),
    delete: (id) => api.delete(`/mobiles/${id}`)
};

// ============ ANALYTICS API ============
export const analyticsAPI = {
    getSummary: () => retryRequest(() => api.get('/analytics/summary')),
    getMonthly: (year) => retryRequest(() => api.get('/analytics/monthly', { params: { year } })),
    getDaily: (month, year) => retryRequest(() => api.get('/analytics/daily', { params: { month, year } }))
};

export default api;
