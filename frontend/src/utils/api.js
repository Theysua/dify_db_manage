/**
 * API工具模块
 * 提供统一的API请求处理，包括认证、错误处理等
 */

import axios from 'axios';
import { message } from 'antd';

// API基础URL，根据环境配置
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';

// 创建一个axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 默认30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 添加认证信息的fetch包装函数
 * @param {string} url - 请求URL
 * @param {Object} options - fetch选项
 * @returns {Promise} - fetch promise
 */
export const fetchWithAuth = async (url, options = {}) => {
  try {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 设置默认选项
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };
    
    // 合并选项
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };
    
    // 发送请求
    const response = await fetch(url, fetchOptions);
    
    // 处理401未授权错误（token过期或无效）
    if (response.status === 401) {
      // 清除本地存储的token
      localStorage.removeItem('token');
      
      // 提示用户
      message.error('您的登录已过期，请重新登录');
      
      // 重定向到登录页面
      window.location.href = '/login';
      
      return Promise.reject(new Error('登录已过期'));
    }
    
    return response;
  } catch (error) {
    console.error('API请求错误：', error);
    return Promise.reject(error);
  }
};

/**
 * GET请求函数
 * @param {string} url - 请求URL
 * @param {Object} params - URL参数
 * @returns {Promise} - 请求Promise
 */
export const get = async (url, params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await apiClient.get(url, { params, headers });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * POST请求函数
 * @param {string} url - 请求URL
 * @param {Object} data - 请求体数据
 * @returns {Promise} - 请求Promise
 */
export const post = async (url, data = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await apiClient.post(url, data, { headers });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * PUT请求函数
 * @param {string} url - 请求URL
 * @param {Object} data - 请求体数据
 * @returns {Promise} - 请求Promise
 */
export const put = async (url, data = {}) => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await apiClient.put(url, data, { headers });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * DELETE请求函数
 * @param {string} url - 请求URL
 * @returns {Promise} - 请求Promise
 */
export const del = async (url) => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await apiClient.delete(url, { headers });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * API错误处理函数
 * @param {Error} error - 错误对象
 */
const handleApiError = (error) => {
  if (error.response) {
    // 服务器响应错误
    const { status, data } = error.response;
    
    if (status === 401) {
      // 未授权，清除token并重定向到登录页
      localStorage.removeItem('token');
      message.error('您的登录已过期，请重新登录');
      window.location.href = '/login';
    } else if (status === 403) {
      // 权限不足
      message.error('权限不足，无法执行此操作');
    } else if (status === 400) {
      // 请求错误
      const errorMessage = data.detail || '请求参数错误';
      message.error(errorMessage);
    } else if (status === 500) {
      // 服务器错误
      message.error('服务器错误，请稍后再试');
    } else {
      // 其他错误
      message.error(`请求失败: ${data.detail || error.message}`);
    }
  } else if (error.request) {
    // 请求发送但未收到响应
    message.error('无法连接到服务器，请检查网络连接');
  } else {
    // 请求设置错误
    message.error(`请求错误: ${error.message}`);
  }
};

export default {
  get,
  post,
  put,
  del,
  fetchWithAuth,
  API_BASE_URL,
};
