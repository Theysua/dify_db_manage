import { message } from 'antd';

/**
 * Handles API errors and displays appropriate messages
 * @param {Error} error - The error object from API call
 * @param {string} defaultMessage - Default message to display if no specific error message found
 */
export const handleApiError = (error, defaultMessage = '操作失败，请稍后再试') => {
  console.error('API Error:', error);
  
  let errorMessage = defaultMessage;
  
  // Extract error message from response if available
  if (error.response) {
    const { data, status } = error.response;
    
    // Handle different status codes
    if (status === 401) {
      errorMessage = '未授权，请重新登录';
    } else if (status === 403) {
      errorMessage = '无权限执行此操作';
    } else if (status === 404) {
      errorMessage = '请求的资源不存在';
    } else if (status === 422) {
      errorMessage = '提交的数据无效';
      // Extract validation errors if available
      if (data.detail && Array.isArray(data.detail)) {
        const firstError = data.detail[0];
        if (firstError.loc && firstError.msg) {
          errorMessage = `${firstError.loc[1]}: ${firstError.msg}`;
        }
      }
    } else if (status >= 500) {
      errorMessage = '服务器错误，请联系管理员';
    }
    
    // Use error message from response if available
    if (data && data.detail && typeof data.detail === 'string') {
      errorMessage = data.detail;
    }
  }
  
  message.error(errorMessage);
  return errorMessage;
};

/**
 * Shows success message for operations
 * @param {string} msg - Success message to display
 */
export const showSuccess = (msg) => {
  message.success(msg);
};

export default {
  handleApiError,
  showSuccess
};
