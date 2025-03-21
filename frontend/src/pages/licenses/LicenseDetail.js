import React from 'react';
import { Typography, Card } from 'antd';

const { Title } = Typography;

const LicenseDetail = () => {
  return (
    <div className="license-detail-container">
      <div className="page-header">
        <Title level={2}>许可证详情</Title>
      </div>
      
      <Card>
        <p>许可证详情页面正在开发中...</p>
      </Card>
    </div>
  );
};

export default LicenseDetail;
