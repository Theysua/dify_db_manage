import React from 'react';
import { Row, Col } from 'antd';

/**
 * 响应式卡片网格组件
 * 根据不同屏幕尺寸自动调整卡片布局
 */
export const ResponsiveCardGrid = ({ children, gutter = [16, 16] }) => {
  // 将子组件转换为数组以便迭代
  const childrenArray = React.Children.toArray(children);
  
  return (
    <Row gutter={gutter}>
      {childrenArray.map((child, index) => (
        <Col 
          key={index}
          xs={24}        // 移动设备：全宽
          sm={24}        // 小屏平板：全宽
          md={12}        // 大屏平板：两列
          lg={8}         // 笔记本：三列
          xl={6}         // 桌面：四列
          xxl={6}        // 大屏桌面：四列
        >
          {child}
        </Col>
      ))}
    </Row>
  );
};

/**
 * 两栏内容布局组件
 * 适合详情页面的主次内容布局
 */
export const TwoColumnLayout = ({ 
  main, 
  side, 
  sideWidth = 8,
  reversed = false, 
  gutter = 16 
}) => {
  const mainWidth = 24 - sideWidth;
  
  return (
    <Row gutter={gutter}>
      {!reversed ? (
        <>
          <Col xs={24} md={mainWidth}>{main}</Col>
          <Col xs={24} md={sideWidth}>{side}</Col>
        </>
      ) : (
        <>
          <Col xs={24} md={sideWidth}>{side}</Col>
          <Col xs={24} md={mainWidth}>{main}</Col>
        </>
      )}
    </Row>
  );
};

/**
 * 可折叠内容区组件
 * 可以折叠/展开内容区域，减少页面滚动
 */
export const CollapsibleSection = ({ 
  title, 
  children, 
  defaultExpanded = true,
  extra = null
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  
  const toggle = () => setExpanded(!expanded);
  
  return (
    <div className="collapsible-section">
      <div 
        className="collapsible-header" 
        onClick={toggle}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          cursor: 'pointer'
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {extra}
          <span style={{ marginLeft: 8 }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>
      
      <div 
        className="collapsible-content"
        style={{
          maxHeight: expanded ? '2000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 内容布局容器
 * 提供一致的页面内容容器样式
 */
export const ContentContainer = ({ children, fullWidth = false }) => {
  return (
    <div 
      style={{ 
        maxWidth: fullWidth ? '100%' : '1200px',
        margin: '0 auto',
        padding: '24px',
        width: '100%'
      }}
    >
      {children}
    </div>
  );
};
