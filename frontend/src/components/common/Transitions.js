import React from 'react';
import { motion } from 'framer-motion';

/**
 * 页面过渡动效组件
 * 为页面切换提供平滑的过渡效果
 */
export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 悬浮卡片效果组件
 * 为卡片提供悬浮反馈效果
 */
export const HoverCard = ({ children, ...props }) => {
  return (
    <motion.div
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        transition: { duration: 0.2 }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * 按钮动效组件
 * 为按钮提供点击反馈效果
 */
export const AnimatedButton = ({ children, ...props }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

/**
 * 列表项进入动效
 * 为列表项提供级联进入效果
 */
export const ListItemAnimation = ({ children, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.05, // 级联延迟
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 淡入效果
 * 简单的淡入动画
 */
export const FadeIn = ({ children, duration = 0.5, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 可折叠内容
 * 平滑展开和折叠内容
 */
export const CollapsibleContent = ({ isOpen, children }) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ 
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0
      }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 加载动画容器
 * 为加载状态提供淡入淡出效果
 */
export const LoadingTransition = ({ children, isLoading }) => {
  return (
    <motion.div
      animate={{ opacity: isLoading ? 0.7 : 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};
