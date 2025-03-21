import axios from 'axios';
import { message, notification } from 'antd';
import config from '../config';

// 存储当前连接状态
let isBackendConnected = false;
let retryCount = 0;
const MAX_RETRY_ATTEMPTS = 5;

/**
 * 检查后端连接状态并显示状态
 * @param {boolean} showSuccess - 是否显示成功通知
 * @returns {Promise<boolean>} 如果后端可用返回true
 */
export const checkBackendConnection = async (showSuccess = false) => {
  try {
    // 使用统计接口作为健康检查
    await axios.get(`${config.apiBaseUrl}/deployments/statistics`, {
      timeout: 5000 // 5秒超时设置
    });
    
    // 如果之前连接失败现在连接成功了，显示恢复通知
    if (!isBackendConnected || showSuccess) {
      notification.success({
        message: '后端连接成功',
        description: '已成功连接到后端服务',
        duration: 3,
      });
    }
    
    isBackendConnected = true;
    retryCount = 0;
    console.log('Backend connection successful');
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    
    retryCount++;
    
    // 确定错误类型和适当的消息
    let errorMessage = '无法连接到后端服务，请确保后端服务已启动';
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = '连接后端服务超时，请检查网络或服务器状态';
    } else if (error.response) {
      if (error.response.status === 404) {
        errorMessage = '后端API路径不存在，请检查配置或API版本';
      } else {
        errorMessage = `后端服务错误 (${error.response.status}): ${error.response.data?.detail || error.response.statusText}`;
      }
    }
    
    // 只在状态变化或首次失败时显示错误通知
    if (isBackendConnected || retryCount <= 1) {
      notification.error({
        message: '后端连接失败',
        description: errorMessage,
        duration: 0, // 不自动关闭
        key: 'backend-connection-error',
      });
    }
    
    isBackendConnected = false;
    return false;
  }
};

/**
 * 定期检查后端连接状态
 * @param {number} intervalMs - 检查间隔(毫秒)
 * @returns {number} 定时器ID，可用于清除
 */
export const startPeriodicConnectionCheck = (intervalMs = 30000) => {
  // 初始检查
  checkBackendConnection(true);
  
  // 如果后端未连接，最初使用更快的重试间隔
  const initialInterval = !isBackendConnected ? 5000 : intervalMs;
  
  // 设置定期检查
  return setInterval(() => {
    checkBackendConnection();
  }, intervalMs);
};

/**
 * 获取当前的后端连接状态
 * @returns {boolean} 当前连接状态
 */
export const getConnectionStatus = () => {
  return isBackendConnected;
};

/**
 * 执行手动重连尝试
 * @returns {Promise<boolean>} 重连结果
 */
export const retryConnection = async () => {
  // 重置重试计数
  retryCount = 0;
  notification.info({
    message: '尝试重新连接',
    description: '正在尝试重新连接到后端服务...',
    duration: 2,
  });
  return await checkBackendConnection(true);
};

export default {
  checkBackendConnection,
  startPeriodicConnectionCheck,
  getConnectionStatus,
  retryConnection
};
