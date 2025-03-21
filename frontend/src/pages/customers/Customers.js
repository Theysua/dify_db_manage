import React from 'react';
import { Typography, Card } from 'antd';

const { Title } = Typography;

const Customers = () => {
  return (
    <div className="customers-container">
      <div className="page-header">
        <Title level={2}>客户管理</Title>
      </div>
      
      <Card>
        <p>客户管理页面正在开发中...</p>
      </Card>
    </div>
  );
};

export default Customers;
