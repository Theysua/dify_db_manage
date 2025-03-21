import React from 'react';
import { Typography, Card } from 'antd';

const { Title } = Typography;

const EngineerDetail = () => {
  return (
    <div className="engineer-detail-container">
      <div className="page-header">
        <Title level={2}>工程师详情</Title>
      </div>
      
      <Card>
        <p>工程师详情页面正在开发中...</p>
      </Card>
    </div>
  );
};

export default EngineerDetail;
