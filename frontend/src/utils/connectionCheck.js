import axios from 'axios';
import { message } from 'antd';
import config from '../config';

/**
 * Check backend connectivity and show status
 * @returns {Promise<boolean>} True if backend is available
 */
export const checkBackendConnection = async () => {
  try {
    // Try to get deployment statistics as a simple health check
    await axios.get(`${config.apiBaseUrl}/deployments/statistics`);
    console.log('Backend connection successful');
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    message.error('无法连接到后端服务，请确保后端服务已启动');
    return false;
  }
};

/**
 * Periodic check for backend connectivity
 * @param {number} intervalMs - Check interval in milliseconds
 * @returns {number} Interval ID for clearing if needed
 */
export const startPeriodicConnectionCheck = (intervalMs = 30000) => {
  // Initial check
  checkBackendConnection();
  
  // Setup periodic check
  return setInterval(() => {
    checkBackendConnection();
  }, intervalMs);
};

export default {
  checkBackendConnection,
  startPeriodicConnectionCheck
};
