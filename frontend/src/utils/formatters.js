import moment from 'moment';
import { Tag } from 'antd';
import React from 'react';

/**
 * Format a date string to display format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {string} format - Output format (default: YYYY年MM月DD日)
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, format = 'YYYY年MM月DD日') => {
  if (!dateString) return '-';
  return moment(dateString).format(format);
};

/**
 * Get tag component for deployment status
 * @param {string} status - Deployment status
 * @returns {JSX.Element} Tag component
 */
export const getDeploymentStatusTag = (status) => {
  if (status === 'COMPLETED') {
    return <Tag color="green">已完成</Tag>;
  } else if (status === 'IN_PROGRESS') {
    return <Tag color="blue">进行中</Tag>;
  } else if (status === 'PLANNED') {
    return <Tag color="gold">已计划</Tag>;
  } else if (status === 'FAILED') {
    return <Tag color="red">失败</Tag>;
  }
  return <Tag>{status}</Tag>;
};

/**
 * Get tag component for license status
 * @param {string} status - License status
 * @returns {JSX.Element} Tag component
 */
export const getLicenseStatusTag = (status) => {
  if (status === 'ACTIVE') {
    return <Tag color="green">有效</Tag>;
  } else if (status === 'EXPIRED') {
    return <Tag color="red">已过期</Tag>;
  } else if (status === 'TERMINATED') {
    return <Tag color="volcano">已终止</Tag>;
  } else if (status === 'PENDING') {
    return <Tag color="gold">待激活</Tag>;
  }
  return <Tag>{status}</Tag>;
};

/**
 * Get text for deployment type
 * @param {string} type - Deployment type
 * @returns {string} Text representation
 */
export const getDeploymentTypeText = (type) => {
  const typeMap = {
    'INITIAL': '初始部署',
    'UPDATE': '更新',
    'MIGRATION': '迁移',
    'REINSTALLATION': '重新安装'
  };
  return typeMap[type] || type;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: CNY)
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'CNY') => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export default {
  formatDate,
  getDeploymentStatusTag,
  getLicenseStatusTag,
  getDeploymentTypeText,
  formatCurrency
};
