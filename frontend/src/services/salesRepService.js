import axios from 'axios';
import config from '../config';

// 获取认证头信息
const getAuthHeader = () => {
  // 根据用户角色选择不同的令牌
  const userRole = localStorage.getItem('dify_user_role');
  let token;
  
  if (userRole === 'partner') {
    token = localStorage.getItem('dify_partner_token');
  } else {
    token = localStorage.getItem('dify_token');
  }
  
  return {
    headers: {
      Authorization: `Bearer ${token || ''}`
    }
  };
};

/**
 * 获取所有销售代表
 */
export const getAllSalesReps = (params = {}) => {
  return axios.get(`${config.apiBaseUrl}/sales-reps`, {
    ...getAuthHeader(),
    params
  });
};

/**
 * 获取单个销售代表
 */
export const getSalesRep = (id) => {
  return axios.get(`${config.apiBaseUrl}/sales-reps/${id}`, getAuthHeader());
};

/**
 * 获取当前登录用户的销售代表信息
 */
export const getCurrentSalesRep = () => {
  return axios.get(`${config.apiBaseUrl}/sales-reps/me`, getAuthHeader());
};

/**
 * 创建销售代表
 */
export const createSalesRep = (data) => {
  return axios.post(`${config.apiBaseUrl}/sales-reps`, data, getAuthHeader());
};

/**
 * 更新销售代表信息
 */
export const updateSalesRep = (id, data) => {
  return axios.put(`${config.apiBaseUrl}/sales-reps/${id}`, data, getAuthHeader());
};

/**
 * 删除销售代表
 */
export const deleteSalesRep = (id) => {
  return axios.delete(`${config.apiBaseUrl}/sales-reps/${id}`, getAuthHeader());
};
