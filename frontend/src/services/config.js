// API基础URL配置
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

// 网站标题配置
export const SITE_TITLE = 'Dify许可证管理系统';

// 合作伙伴相关配置
export const PARTNER_STORAGE_KEY = 'dify_partner_token';

// 请求超时配置（毫秒）
export const REQUEST_TIMEOUT = 30000;

// 分页默认值
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
