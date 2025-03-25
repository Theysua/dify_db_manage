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
 * 获取所有合作伙伴
 */
export const getAllPartners = (params = {}) => {
  return axios.get(`${config.apiBaseUrl}/partners`, {
    ...getAuthHeader(),
    params
  });
};

/**
 * 获取单个合作伙伴信息
 */
export const getPartner = (id) => {
  return axios.get(`${config.apiBaseUrl}/partners/${id}`, getAuthHeader());
};

/**
 * 获取当前登录用户的合作伙伴信息
 */
export const getCurrentPartner = () => {
  return axios.get(`${config.apiBaseUrl}/partners/me`, getAuthHeader());
};

/**
 * 创建合作伙伴
 */
export const createPartner = (data) => {
  return axios.post(`${config.apiBaseUrl}/admin/partners`, data, getAuthHeader());
};

/**
 * 更新合作伙伴信息
 */
export const updatePartner = (id, data) => {
  return axios.put(`${config.apiBaseUrl}/admin/partners/${id}`, data, getAuthHeader());
};

/**
 * 删除合作伙伴
 */
export const deletePartner = (id) => {
  return axios.delete(`${config.apiBaseUrl}/admin/partners/${id}`, getAuthHeader());
};
