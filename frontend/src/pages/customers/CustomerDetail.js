import React from 'react';
import { Typography, Card } from 'antd';

const { Title } = Typography;

const CustomerDetail = () => {
  return (
    <div className="customer-detail-container">
      <div className="page-header">
        <Title level={2}>客户详情</Title>
      </div>
      
      <Card>
        <p>客户详情页面正在开发中...</p>
      </Card>
    </div>
  );
};

export default CustomerDetail;
