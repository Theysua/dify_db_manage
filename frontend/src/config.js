/**
 * Application configuration
 */
const config = {
  // API base URL - used by services/api.js
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || '/api/v1',
  
  // Default pagination settings
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: ['10', '20', '50', '100'],
  },
  
  // Date format settings
  dateFormat: {
    display: 'YYYY年MM月DD日', // Format for displaying dates
    input: 'YYYY-MM-DD',      // Format for date inputs
    iso: 'YYYY-MM-DD',        // Format for sending to API
  },
  
  // General app settings
  app: {
    name: '许可证管理系统',
    version: '1.0.0',
    locale: 'zh-CN',
    copyright: `Dify 许可证管理系统 ©${new Date().getFullYear()} 由 Xuan 创建`,
  },
  
  // Deploy environments for dropdown selections
  deployEnvironments: [
    { value: 'PRODUCTION', label: '生产环境' },
    { value: 'STAGING', label: '预发布环境' },
    { value: 'TEST', label: '测试环境' },
    { value: 'DEVELOPMENT', label: '开发环境' },
  ],
  
  // License types for dropdown selections
  licenseTypes: [
    { value: 'ENTERPRISE', label: 'Dify企业版' },
  ],
};

export default config;
