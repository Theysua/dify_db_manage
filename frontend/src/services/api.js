import axios from 'axios';
import { message } from 'antd';

// Base API instance
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器: 添加认证令牌
api.interceptors.request.use(
  (config) => {
    // 根据用户角色选择不同的令牌
    const userRole = localStorage.getItem('dify_user_role');
    let token;
    
    if (userRole === 'partner') {
      token = localStorage.getItem('dify_partner_token');
    } else {
      token = localStorage.getItem('dify_token');
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器: 处理错误和认证问题
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
    
    // 处理认证相关错误
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // 未认证，重定向到登录页面
        message.error('会话已过期，请重新登录');
        localStorage.removeItem('dify_token');
        localStorage.removeItem('dify_partner_token');
        localStorage.removeItem('dify_user_info');
        localStorage.removeItem('dify_user_role');
        
        // 重定向到登录页
        window.location.href = '/login';
        localStorage.removeItem('dify_partner_info');
        localStorage.removeItem('dify_user_role');
        
        // 如果不是在登录页面，则重定向到登录页面
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        message.error('您没有权限访问此资源');
      }
    }
    
    return Promise.reject(error);
  }
);

// License API
export const licenseAPI = {
  getAll: (params) => api.get('/licenses', { params }),
  getById: (id) => api.get(`/licenses/${id}`),
  create: (data) => api.post('/licenses', data),
  update: (id, data) => api.put(`/licenses/${id}`, data),
  delete: (id) => api.delete(`/licenses/${id}`),
  getStatistics: () => api.get('/licenses/statistics'),
};

// Deployment API
export const deploymentAPI = {
  getAll: (params) => api.get('/deployments', { params }),
  getById: (id) => api.get(`/deployments/${id}`),
  create: (data) => api.post('/deployments', data),
  update: (id, data) => api.put(`/deployments/${id}`, data),
  delete: (id) => api.delete(`/deployments/${id}`),
  getStatistics: () => api.get('/deployments/statistics'),
};

// Customer API
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getStatistics: () => api.get('/customers/statistics'),
};

// Engineer API
export const engineerAPI = {
  getAll: (params) => api.get('/engineers', { params }),
  getById: (id) => api.get(`/engineers/${id}`),
  create: (data) => api.post('/engineers', data),
  update: (id, data) => api.put(`/engineers/${id}`, data),
  delete: (id) => api.delete(`/engineers/${id}`),
};

// Sales Rep API
export const salesRepAPI = {
  getAll: (params) => api.get('/sales-reps', { params }),
  getById: (id) => api.get(`/sales-reps/${id}`),
  create: (data) => api.post('/sales-reps', data),
  update: (id, data) => api.put(`/sales-reps/${id}`, data),
  delete: (id) => api.delete(`/sales-reps/${id}`),
};

// Reseller API
export const resellerAPI = {
  getAll: (params) => api.get('/resellers', { params }),
  getById: (id) => api.get(`/resellers/${id}`),
  create: (data) => api.post('/resellers', data),
  update: (id, data) => api.put(`/resellers/${id}`, data),
  delete: (id) => api.delete(`/resellers/${id}`),
};

// Auth API服务
export const authAPI = {
  // 管理员登录
  login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  
  // 合作伙伴登录
  partnerLogin(username, password) {
    return api.post('/auth/partner-login', {
      Username: username,
      Password: password
    });
  },
  
  // 获取当前用户信息
  getCurrentUser() {
    return api.get('/users/me');
  }
};

export default api;
