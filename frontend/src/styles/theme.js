/**
 * Dify Sales Database Management System
 * 品牌主题定义文件
 */

// Dify品牌色彩系统
export const brandColors = {
  primary: '#4E6EF2',      // Dify主色调
  secondary: '#08C5B2',    // 辅助色
  success: '#36B37E',      // 成功色
  warning: '#FFAB00',      // 警告色
  error: '#FF5630',        // 错误色
  info: '#0065FF',         // 信息色
  // 扩展色阶
  primaryLight: '#E9EEFF',
  secondaryLight: '#E6F9F7',
  primaryDark: '#3F51E1',
  secondaryDark: '#06A091',
  // 中性色
  black: '#171C2C',
  darkGrey: '#4B5563',
  midGrey: '#9CA3AF',
  lightGrey: '#E5E7EB',
  offWhite: '#F9FAFB',
  white: '#FFFFFF',
};

// 自定义Ant Design主题
export const customTheme = {
  token: {
    colorPrimary: brandColors.primary,
    colorSuccess: brandColors.success,
    colorWarning: brandColors.warning,
    colorError: brandColors.error,
    colorInfo: brandColors.info,
    colorTextBase: brandColors.black,
    colorBgBase: brandColors.white,
    borderRadius: 4,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Button: {
      borderRadius: 4,
      controlHeight: 40,
    },
    Card: {
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    },
    Table: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 4,
    },
    Select: {
      borderRadius: 4,
    },
    Menu: {
      itemHoverBg: brandColors.primaryLight,
      itemSelectedBg: brandColors.primaryLight,
      itemSelectedColor: brandColors.primary,
    },
    // 其他组件定制
  }
};

// 深色模式主题
export const darkTheme = {
  token: {
    colorPrimary: brandColors.primary,
    colorSuccess: brandColors.success,
    colorWarning: brandColors.warning,
    colorError: brandColors.error,
    colorInfo: brandColors.info,
    colorTextBase: brandColors.white,
    colorBgBase: '#121212',
    borderRadius: 4,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    ...customTheme.components,
    Card: {
      ...customTheme.components.Card,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    },
  }
};
