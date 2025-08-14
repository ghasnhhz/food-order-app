import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create axios instance
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for refresh token cookies
});

// Request interceptor to add token to headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;
        
        // Save new token
        localStorage.setItem('accessToken', accessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export async function registerUser(userData) {
  try {
    const response = await API.post('/auth/register', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Registration failed' 
    };
  }
}

export async function loginUser(userData) {
  try {
    const response = await API.post('/auth/login', userData);
    
    // Save token and user info
    const { token, user } = response.data;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Login failed' 
    };
  }
}

export async function logoutUser() {
  try {
    await API.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    // Even if logout fails, clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    return { success: false, message: 'Logout failed' };
  }
}

// Menu API functions
export async function getMenu() {
  try {
    const response = await API.get('/menu');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch menu' 
    };
  }
}

// Utility function to check if user is authenticated
export function isAuthenticated() {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
}

// Order API functions
export async function addOrder(orderData) {
  try {
    const response = await API.post('/orders', orderData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to place order' 
    };
  }
}

export async function getOrders() {
  try {
    const response = await API.get('/orders');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch orders' 
    };
  }
}

export async function getOrderById(orderId) {
  try {
    const response = await API.get(`/orders/${orderId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch order' 
    };
  }
}

// Search menu by name
export async function searchMenu(name) {
  try {
    const response = await API.get(`/menu?name=${name}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to search menu' 
    };
  }
}

// Utility function to get current user
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export default API;
