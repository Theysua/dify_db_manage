import React from 'react';
import { Switch, Tooltip } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

/**
 * 主题切换组件
 * 允许用户在深色模式和浅色模式之间切换
 */
const ThemeSwitcher = ({ tooltip = true, size = 'default' }) => {
  const { darkMode, toggleTheme } = useTheme();
  
  const handleToggle = () => {
    toggleTheme();
  };
  
  // 带有动画效果的图标
  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    animate: { rotate: 360, scale: [1, 1.2, 1] },
  };
  
  const switchComponent = (
    <Switch
      checked={darkMode}
      onChange={handleToggle}
      checkedChildren={
        <motion.span
          key="dark"
          initial="initial"
          animate="animate"
          variants={iconVariants}
          transition={{ duration: 0.5 }}
        >
          <BulbFilled />
        </motion.span>
      }
      unCheckedChildren={
        <motion.span
          key="light"
          initial="initial"
          animate="animate"
          variants={iconVariants}
          transition={{ duration: 0.5 }}
        >
          <BulbOutlined />
        </motion.span>
      }
      size={size}
      style={{ 
        background: darkMode ? '#1677ff' : undefined,
      }}
    />
  );
  
  // 是否使用工具提示包装
  if (tooltip) {
    return (
      <Tooltip title={darkMode ? '切换到浅色模式' : '切换到深色模式'}>
        {switchComponent}
      </Tooltip>
    );
  }
  
  return switchComponent;
};

export default ThemeSwitcher;
