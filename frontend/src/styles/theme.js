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

// 深色模式专用色彩系统
export const darkModeColors = {
  // 背景色系统 - 由深到浅的5个层级
  bg: {
    base: '#121212',        // 基础背景色
    elevated: '#1F1F1F',    // 稍微突出的背景(如卡片)
    higher: '#242424',      // 更高层级的背景(如弹出层)
    highest: '#2C2C2C',     // 最高层级背景(如模态框)
    overlay: '#383838',     // 覆盖层背景
  },
  
  // 文本色系统 - 4个不同重要程度的层级
  text: {
    primary: 'rgba(255, 255, 255, 0.85)',    // 主要文本
    secondary: 'rgba(255, 255, 255, 0.65)',  // 次要文本
    disabled: 'rgba(255, 255, 255, 0.45)',   // 禁用文本
    hint: 'rgba(255, 255, 255, 0.35)',       // 提示文本
  },
  
  // 边框色系统 - 3个不同层级
  border: {
    base: '#303030',         // 基础边框色
    light: '#3A3A3A',        // 轻量边框
    strong: '#505050',       // 强调边框
    divider: '#2C2C2C',      // 分割线颜色
  },
  
  // 表单控件色系统
  form: {
    inputBg: '#1A1A1A',      // 输入框背景
    inputBorder: '#383838',  // 输入框边框
    inputHover: '#505050',   // 输入框悬停边框
    inputFocus: '#4E6EF2',   // 输入框聚焦边框
  },
  
  // 表格专用色系统
  table: {
    headerBg: '#242424',     // 表头背景
    rowBg: '#1F1F1F',        // 奇数行背景
    rowAltBg: '#242424',     // 偶数行背景
    rowHoverBg: '#2C2C2C',   // 行悬停背景
    border: '#303030',       // 表格边框
  },
  
  // 状态反馈色 - 深色模式下调整亮度和饱和度
  state: {
    successBg: 'rgba(54, 179, 126, 0.15)',  // 成功状态背景
    warningBg: 'rgba(255, 171, 0, 0.15)',   // 警告状态背景
    errorBg: 'rgba(255, 86, 48, 0.15)',     // 错误状态背景
    infoBg: 'rgba(0, 101, 255, 0.15)',      // 信息状态背景
    
    successBorder: 'rgba(54, 179, 126, 0.3)',  // 成功状态边框
    warningBorder: 'rgba(255, 171, 0, 0.3)',   // 警告状态边框
    errorBorder: 'rgba(255, 86, 48, 0.3)',     // 错误状态边框
    infoBorder: 'rgba(0, 101, 255, 0.3)',      // 信息状态边框
  },
  
  // 交互元素色系统
  interaction: {
    hover: '#2A2A2A',        // 通用悬停背景
    active: '#363636',       // 通用激活背景
    selected: '#2D3655',     // 选中状态背景(带品牌色)
    focusRing: 'rgba(78, 110, 242, 0.5)', // 聚焦环
  },
  
  // 阴影系统
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
  },
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
    colorTextBase: darkModeColors.text.primary,  // 使用定义的主文本颜色
    colorBgBase: darkModeColors.bg.base,         // 使用定义的基础背景色
    borderRadius: 4,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    
    // 补充额外的标准token
    colorText: darkModeColors.text.primary,
    colorTextSecondary: darkModeColors.text.secondary,
    colorTextTertiary: darkModeColors.text.disabled,
    colorTextQuaternary: darkModeColors.text.hint,
    
    colorBgContainer: darkModeColors.bg.elevated,
    colorBgElevated: darkModeColors.bg.higher,
    colorBgSpotlight: darkModeColors.bg.highest,
    
    colorBorder: darkModeColors.border.base,
    colorBorderSecondary: darkModeColors.border.light,
    colorSplit: darkModeColors.border.divider,
    
    controlItemBgHover: darkModeColors.interaction.hover,
    controlItemBgActive: darkModeColors.interaction.active,
    controlItemBgActiveHover: darkModeColors.interaction.selected,
    
    boxShadow: darkModeColors.shadow.sm,
    boxShadowSecondary: darkModeColors.shadow.md,
    boxShadowTertiary: darkModeColors.shadow.lg,
    
    // 文本相关
    colorTextPlaceholder: darkModeColors.text.hint,
    colorTextDisabled: darkModeColors.text.disabled,
    colorTextHeading: darkModeColors.text.primary,
    colorTextLabel: darkModeColors.text.secondary,
    colorTextDescription: darkModeColors.text.secondary,
    
    // 表单相关
    colorBgContainerDisabled: 'rgba(255, 255, 255, 0.08)',
    colorBgTextHover: darkModeColors.interaction.hover,
    colorBgTextActive: darkModeColors.interaction.active,
  },
  components: {
    Button: {
      colorBgContainer: darkModeColors.bg.elevated,
      colorBorder: darkModeColors.border.base,
      colorText: darkModeColors.text.primary,
      
      // 主要按钮
      colorPrimaryHover: brandColors.primaryDark,
      colorPrimaryActive: brandColors.primaryDark,
      
      // 默认按钮悬停
      colorBgContainerHover: darkModeColors.interaction.hover,
      colorBgContainerActive: darkModeColors.interaction.active,
      
      // 文本和链接按钮
      colorLink: brandColors.primary,
      colorLinkHover: brandColors.primaryDark,
      colorLinkActive: brandColors.primaryDark,
      
      // 危险按钮
      colorErrorHover: '#FF7452',
      colorErrorActive: '#E54B2E',
    },
    Card: {
      colorBgContainer: darkModeColors.bg.elevated,
      colorBorderSecondary: darkModeColors.border.base,
      boxShadow: darkModeColors.shadow.sm,
      borderRadius: 8,
      colorTextHeading: darkModeColors.text.primary,
    },
    Descriptions: {
      colorText: darkModeColors.text.primary,
      colorTextSecondary: darkModeColors.text.secondary,
      colorSplit: darkModeColors.border.divider,
      colorFillAlter: darkModeColors.bg.higher,
    },
    Divider: {
      colorSplit: darkModeColors.border.divider,
    },
    Table: {
      colorBgContainer: darkModeColors.bg.elevated,
      colorText: darkModeColors.text.primary,
      
      // 表头
      colorFillAlter: darkModeColors.table.headerBg,
      colorFillContent: darkModeColors.table.rowBg,
      colorFillContentHover: darkModeColors.table.rowHoverBg,
      
      // 边框
      colorBorderSecondary: darkModeColors.table.border,
      
      // 斑马纹
      colorFillSecondary: darkModeColors.table.rowAltBg,
      
      // 排序和过滤图标
      colorIcon: darkModeColors.text.secondary,
      colorIconHover: darkModeColors.text.primary,
    },
    Menu: {
      // 调整Menu组件在深色模式下的颜色
      colorItemBg: darkModeColors.bg.base,
      colorSubItemBg: darkModeColors.bg.higher,
      colorItemText: darkModeColors.text.primary,
      colorItemTextHover: brandColors.primary,
      colorItemTextSelected: brandColors.primary,
      colorItemBgHover: darkModeColors.interaction.hover,
      colorItemBgSelected: darkModeColors.interaction.selected,
      colorItemBgActive: darkModeColors.interaction.active,
      colorItemBgSelectedHover: darkModeColors.interaction.selected,
      
      // 分割线
      colorItemDivider: darkModeColors.border.divider,
    },
    Input: {
      colorBgContainer: darkModeColors.form.inputBg,
      colorBorder: darkModeColors.form.inputBorder,
      colorPrimaryHover: darkModeColors.form.inputHover,
      colorPrimaryActive: darkModeColors.form.inputFocus,
      colorText: darkModeColors.text.primary,
      colorTextPlaceholder: darkModeColors.text.hint,
      colorTextDisabled: darkModeColors.text.disabled,
      
      // 激活状态
      activeBorderColor: brandColors.primary,
      activeShadow: `0 0 0 2px ${darkModeColors.interaction.focusRing}`,
      
      // 悬停状态
      hoverBorderColor: darkModeColors.form.inputHover,
      
      // 错误状态
      errorBorderColor: brandColors.error,
      errorShadow: `0 0 0 2px rgba(255, 86, 48, 0.2)`,
    },
    Select: {
      colorBgContainer: darkModeColors.form.inputBg,
      colorBorder: darkModeColors.form.inputBorder,
      colorText: darkModeColors.text.primary,
      colorTextPlaceholder: darkModeColors.text.hint,
      
      // 下拉菜单
      colorBgElevated: darkModeColors.bg.higher,
      colorItemBgHover: darkModeColors.interaction.hover,
      colorItemBgSelected: darkModeColors.interaction.selected,
      colorItemText: darkModeColors.text.primary,
      colorItemTextHover: darkModeColors.text.primary,
      colorItemTextSelected: brandColors.primary,
      
      // 激活状态
      colorPrimaryHover: darkModeColors.form.inputHover,
      colorPrimaryActive: darkModeColors.form.inputFocus,
      activeBorderColor: brandColors.primary,
      activeShadow: `0 0 0 2px ${darkModeColors.interaction.focusRing}`,
      
      // 多选标签
      colorBgTag: darkModeColors.interaction.selected,
      colorTextTag: darkModeColors.text.primary,
    },
    Empty: {
      colorText: darkModeColors.text.disabled,
      colorTextDisabled: darkModeColors.text.hint,
      colorIcon: darkModeColors.text.disabled,
    },
    Spin: {
      colorPrimary: brandColors.primary,
    },
    
    // 添加更多组件的暗色模式配置
    Modal: {
      colorBgElevated: darkModeColors.bg.highest,
      colorBgMask: 'rgba(0, 0, 0, 0.65)',
      colorText: darkModeColors.text.primary,
      titleColor: darkModeColors.text.primary,
      contentBg: darkModeColors.bg.highest,
      headerBg: darkModeColors.bg.highest,
      footerBg: darkModeColors.bg.highest,
      colorIcon: darkModeColors.text.primary,
      colorIconHover: darkModeColors.text.secondary,
      boxShadow: darkModeColors.shadow.lg,
    },
    
    Drawer: {
      colorBgElevated: darkModeColors.bg.higher,
      colorText: darkModeColors.text.primary,
      colorIcon: darkModeColors.text.primary,
      colorIconHover: darkModeColors.text.secondary,
      colorBgMask: 'rgba(0, 0, 0, 0.65)',
      headerBg: darkModeColors.bg.higher,
      footerBg: darkModeColors.bg.higher,
      bodyBg: darkModeColors.bg.higher,
    },
    
    Dropdown: {
      colorBgElevated: darkModeColors.bg.higher,
      colorText: darkModeColors.text.primary,
      boxShadow: darkModeColors.shadow.md,
      colorTextDisabled: darkModeColors.text.disabled,
      colorBgEmpty: darkModeColors.bg.higher,
      colorItemText: darkModeColors.text.primary,
      colorItemTextSelected: brandColors.primary,
      colorItemBgHover: darkModeColors.interaction.hover,
      controlItemBgActive: darkModeColors.interaction.active,
      colorItemBgSelected: darkModeColors.interaction.selected,
    },
    
    DatePicker: {
      colorBgContainer: darkModeColors.form.inputBg,
      colorBgElevated: darkModeColors.bg.higher,
      colorBorder: darkModeColors.form.inputBorder,
      colorText: darkModeColors.text.primary,
      colorTextDisabled: darkModeColors.text.disabled,
      colorTextPlaceholder: darkModeColors.text.hint,
      colorIcon: darkModeColors.text.secondary,
      colorIconHover: darkModeColors.text.primary,
      colorPrimaryBorder: darkModeColors.form.inputFocus,
      controlItemBgActive: darkModeColors.interaction.active,
      controlItemBgHover: darkModeColors.interaction.hover,
      cellBgDisabled: darkModeColors.bg.base,
      cellHoverWithRangeBg: darkModeColors.interaction.hover,
      boxShadow: darkModeColors.shadow.md,
    },
    
    Tabs: {
      colorText: darkModeColors.text.secondary,
      colorTextSelected: brandColors.primary,
      colorBgContainer: 'transparent',
      colorBorderSecondary: darkModeColors.border.light,
      colorFill: darkModeColors.bg.base,
      colorBgHover: darkModeColors.interaction.hover,
      colorFillContent: darkModeColors.bg.elevated,
      itemSelectedColor: brandColors.primary,
      itemHoverColor: darkModeColors.text.primary,
      inkBarColor: brandColors.primary,
    },
    
    Tag: {
      colorText: darkModeColors.text.primary,
      colorBgContainer: darkModeColors.bg.higher,
      colorBorder: darkModeColors.border.light,
      colorTextHover: darkModeColors.text.primary,
      colorBgContainerHover: darkModeColors.interaction.hover,
      
      // 状态标签的颜色
      defaultBg: darkModeColors.bg.higher,
      defaultColor: darkModeColors.text.primary,
      processingBg: 'rgba(0, 101, 255, 0.15)',
      processingColor: brandColors.info,
      successBg: 'rgba(54, 179, 126, 0.15)',
      successColor: brandColors.success,
      errorBg: 'rgba(255, 86, 48, 0.15)',
      errorColor: brandColors.error,
      warningBg: 'rgba(255, 171, 0, 0.15)',
      warningColor: brandColors.warning,
    },
    
    Alert: {
      colorText: darkModeColors.text.primary,
      colorInfoBg: 'rgba(0, 101, 255, 0.15)',
      colorInfoBorder: 'rgba(0, 101, 255, 0.3)',
      colorSuccessBg: 'rgba(54, 179, 126, 0.15)',
      colorSuccessBorder: 'rgba(54, 179, 126, 0.3)',
      colorWarningBg: 'rgba(255, 171, 0, 0.15)',
      colorWarningBorder: 'rgba(255, 171, 0, 0.3)',
      colorErrorBg: 'rgba(255, 86, 48, 0.15)',
      colorErrorBorder: 'rgba(255, 86, 48, 0.3)',
      colorIcon: darkModeColors.text.primary,
      colorIconInfo: brandColors.info,
      colorIconSuccess: brandColors.success,
      colorIconWarning: brandColors.warning,
      colorIconError: brandColors.error,
    },
    Typography: {
      colorText: darkModeColors.text.primary,
      colorTextSecondary: darkModeColors.text.secondary,
      colorTextDescription: darkModeColors.text.secondary,
      colorTextHeading: darkModeColors.text.primary,
      colorTextTertiary: darkModeColors.text.disabled,
      colorTextLabel: darkModeColors.text.secondary,
      
      // 链接和标记文本
      colorLink: brandColors.primary,
      colorLinkHover: brandColors.primaryDark,
      colorLinkActive: brandColors.primaryDark,
      colorHighlight: brandColors.warning,
      colorWarning: brandColors.warning,
      colorSuccess: brandColors.success,
      colorError: brandColors.error,
    },
    Skeleton: {
      colorFill: 'rgba(255, 255, 255, 0.08)',
      colorFillContent: 'rgba(255, 255, 255, 0.04)',
    },
    
    Switch: {
      colorPrimary: brandColors.primary,
      colorPrimaryHover: brandColors.primaryDark,
      colorPrimaryBorder: 'rgba(78, 110, 242, 0.4)',
      colorTextQuaternary: darkModeColors.text.disabled,
      colorTextTertiary: darkModeColors.text.secondary,
      colorBgContainer: 'rgba(255, 255, 255, 0.15)',
    },
    
    Statistic: {
      colorText: darkModeColors.text.primary,
      colorTextDescription: darkModeColors.text.secondary,
      colorTextHeading: darkModeColors.text.primary,
    },
    
    Segmented: {
      colorBgLayout: darkModeColors.bg.elevated,
      colorBgElevated: darkModeColors.bg.higher,
      colorBgHover: darkModeColors.interaction.hover,
      colorBgActive: darkModeColors.interaction.active,
      colorText: darkModeColors.text.primary,
      colorTextSecondary: darkModeColors.text.secondary,
      colorBorder: darkModeColors.border.light,
      boxShadowHover: 'none',
      boxShadowActive: 'none',
      boxShadowSegmented: 'none',
    },
    
    // 数据显示组件
    Tooltip: {
      colorBgDefault: darkModeColors.bg.highest,
      colorTextLightSolid: darkModeColors.text.primary,
      colorBgSpotlight: darkModeColors.interaction.hover,
      boxShadow: darkModeColors.shadow.sm,
    },
    
    Popover: {
      colorBgElevated: darkModeColors.bg.higher,
      colorText: darkModeColors.text.primary,
      colorBgContainer: darkModeColors.bg.higher,
      boxShadow: darkModeColors.shadow.md,
    },
    
    // 反馈组件
    Message: {
      colorBgElevated: darkModeColors.bg.highest,
      colorText: darkModeColors.text.primary,
      colorSuccess: brandColors.success,
      colorError: brandColors.error,
      colorWarning: brandColors.warning,
      colorInfo: brandColors.info,
      boxShadow: darkModeColors.shadow.md,
    },
    
    Notification: {
      colorBgElevated: darkModeColors.bg.highest,
      colorText: darkModeColors.text.primary,
      colorSuccess: brandColors.success,
      colorError: brandColors.error,
      colorWarning: brandColors.warning,
      colorInfo: brandColors.info,
      boxShadow: darkModeColors.shadow.md,
    },
  }
};
