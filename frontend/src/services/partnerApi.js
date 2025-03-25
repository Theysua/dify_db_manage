import axios from 'axios';
import { API_BASE_URL } from './config';

const partnerApi = axios.create({
  baseURL: `${API_BASE_URL}/partners`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add auth token to requests
partnerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('dify_partner_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Partner authentication services
export const partnerAuth = {
  login: async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/partner-login`, {
      Username: username,
      Password: password
    });
    
    if (response.data && response.data.AccessToken) {
      localStorage.setItem('dify_partner_token', response.data.AccessToken);
      localStorage.setItem('dify_partner_info', JSON.stringify(response.data.Partner));
      localStorage.setItem('dify_user_role', 'partner');
    }
    
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('dify_partner_token');
    localStorage.removeItem('dify_partner_info');
    localStorage.removeItem('dify_user_role');
    window.location.href = '/login';
  },
  
  getPartnerInfo: () => {
    const partnerInfo = localStorage.getItem('dify_partner_info');
    return partnerInfo ? JSON.parse(partnerInfo) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('partner_token');
  },
};

// Order services
export const partnerOrders = {
  createOrder: async (orderData) => {
    const response = await partnerApi.post('/orders', orderData);
    return response.data;
  },
  
  getOrders: async () => {
    const response = await partnerApi.get('/orders');
    return response.data;
  },
  
  getOrderDetails: async (orderId) => {
    const response = await partnerApi.get(`/orders/${orderId}`);
    return response.data;
  },
};

// Partner profile services
export const partnerProfile = {
  getProfile: async () => {
    const response = await partnerApi.get('/me');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await partnerApi.put('/me', profileData);
    return response.data;
  },
};

export default {
  partnerAuth,
  partnerOrders,
  partnerProfile,
};
