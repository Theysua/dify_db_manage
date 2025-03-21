import React from 'react';
import { Typography, Card } from 'antd';

const { Title } = Typography;

const Engineers = () => {
  return (
    <div className="engineers-container">
      <div className="page-header">
        <Title level={2}>工程师管理</Title>
      </div>
      
      <Card>
        <p>工程师管理页面正在开发中...</p>
      </Card>
    </div>
  );
};

export default Engineers;
