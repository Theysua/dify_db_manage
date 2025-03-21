import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error);
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

export default api;
