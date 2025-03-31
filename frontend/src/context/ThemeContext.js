import React, { createContext, useState, useEffect, useContext } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import { customTheme, darkTheme } from '../styles/theme';

// 创建主题上下文
const ThemeContext = createContext();

// 导出ThemeContext以便其他组件可以直接访问
export { ThemeContext };

/**
 * 主题提供器组件
 * 管理应用的主题状态，并提供主题切换功能
 */
export const ThemeProvider = ({ children }) => {
  // 主题状态
  const [darkMode, setDarkMode] = useState(false);
  
  // 初始化时从本地存储或系统设置加载主题偏好
  useEffect(() => {
    // 检查本地存储中的主题偏好
    const savedTheme = localStorage.getItem('dify-dark-mode');
    
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    } else {
      // 如果没有保存偏好，则检查系统主题
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(mediaQuery.matches);
      
      // 监听系统主题变化
      const handler = (e) => setDarkMode(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);
  
  // 切换主题函数
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    // 保存用户偏好到本地存储
    localStorage.setItem('dify-dark-mode', String(newMode));
  };
  
  // 当前使用的主题配置
  const currentTheme = darkMode 
    ? { ...darkTheme, algorithm: antTheme.darkAlgorithm }
    : customTheme;
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <ConfigProvider theme={currentTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

/**
 * 主题Hook
 * 用于在组件中访问和操作主题
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
