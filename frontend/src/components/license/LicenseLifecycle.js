import { 
  Timeline, 
  Card, 
  Tag, 
  Tooltip, 
  Divider,
  Typography,
  Space
} from 'antd';
import {
  ClockCircleOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  UserOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import React from 'react';
import moment from 'moment';

const { Title, Text } = Typography;

/**
 * Component to show the lifecycle of a license
 * @param {Object} license - The license object
 */
const LicenseLifecycle = ({ license }) => {
  if (!license) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'EXPIRED':
        return 'red';
      case 'TERMINATED':
        return 'volcano';
      case 'PENDING':
        return 'gold';
      default:
        return 'default';
    }
  };

  const getDeploymentStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'IN_PROGRESS':
        return 'blue';
      case 'PLANNED':
        return 'gold';
      case 'FAILED':
        return 'red';
      default:
        return 'default';
    }
  };

  const timelineItems = [];

  // Creation date
  if (license.OrderDate) {
    timelineItems.push({
      color: 'blue',
      dot: <ClockCircleOutlined />,
      label: moment(license.OrderDate).format('YYYY-MM-DD'),
      children: (
        <>
          <Text strong>许可证创建</Text>
          <br />
          <Text type="secondary">许可证ID: {license.LicenseID}</Text>
          {license.SalesRepName && (
            <div>
              <Text type="secondary">销售代表: {license.SalesRepName}</Text>
            </div>
          )}
        </>
      )
    });
  }

  // Deployment date
  if (license.DeploymentDate) {
    timelineItems.push({
      color: getDeploymentStatusColor(license.DeploymentStatus),
      dot: <RocketOutlined />,
      label: moment(license.DeploymentDate).format('YYYY-MM-DD'),
      children: (
        <>
          <Text strong>部署状态</Text>
          <br />
          <Tag color={getDeploymentStatusColor(license.DeploymentStatus)}>
            {license.DeploymentStatus === 'COMPLETED' && '部署完成'}
            {license.DeploymentStatus === 'IN_PROGRESS' && '部署中'}
            {license.DeploymentStatus === 'PLANNED' && '计划部署'}
            {license.DeploymentStatus === 'FAILED' && '部署失败'}
          </Tag>
        </>
      )
    });
  }

  // Current usage
  if (license.ActualWorkspaces > 0 || license.ActualUsers > 0) {
    timelineItems.push({
      color: 'green',
      dot: <UserOutlined />,
      label: license.LastCheckDate ? moment(license.LastCheckDate).format('YYYY-MM-DD') : '最新数据',
      children: (
        <>
          <Text strong>当前使用情况</Text>
          <br />
          <Space direction="vertical">
            <div>
              <AppstoreOutlined /> 工作区: {license.ActualWorkspaces}/{license.AuthorizedWorkspaces}
              {license.ActualWorkspaces > license.AuthorizedWorkspaces && (
                <Tag color="red" style={{ marginLeft: 8 }}>超额使用</Tag>
              )}
            </div>
            <div>
              <UserOutlined /> 用户: {license.ActualUsers}/{license.AuthorizedUsers}
              {license.ActualUsers > license.AuthorizedUsers && (
                <Tag color="red" style={{ marginLeft: 8 }}>超额使用</Tag>
              )}
            </div>
          </Space>
        </>
      )
    });
  }

  // Purchase records (renewal/upgrade)
  if (license.PurchaseRecords && license.PurchaseRecords.length > 0) {
    license.PurchaseRecords.forEach(record => {
      let icon = <SyncOutlined />;
      let actionText = '续费';
      let color = 'blue';

      if (record.PurchaseType === 'UPGRADE') {
        icon = <CheckCircleOutlined />;
        actionText = '升级';
        color = 'green';
      } else if (record.PurchaseType === 'EXPANSION') {
        icon = <CheckCircleOutlined />;
        actionText = '扩容';
        color = 'purple';
      }

      timelineItems.push({
        color,
        dot: icon,
        label: moment(record.PurchaseDate).format('YYYY-MM-DD'),
        children: (
          <>
            <Text strong>{actionText}</Text>
            <br />
            <Text type="secondary">订单号: {record.OrderNumber || '无'}</Text>
            {record.PreviousExpiryDate && record.NewExpiryDate && (
              <div>
                <Text type="secondary">
                  到期日期变更: {moment(record.PreviousExpiryDate).format('YYYY-MM-DD')} → {moment(record.NewExpiryDate).format('YYYY-MM-DD')}
                </Text>
              </div>
            )}
            {(record.WorkspacesPurchased > 0 || record.UsersPurchased > 0) && (
              <div>
                {record.WorkspacesPurchased > 0 && (
                  <Text type="secondary">增加工作区: {record.WorkspacesPurchased}</Text>
                )}
                {record.UsersPurchased > 0 && (
                  <Text type="secondary">增加用户: {record.UsersPurchased}</Text>
                )}
              </div>
            )}
          </>
        )
      });
    });
  }

  // Expiry date
  if (license.ExpiryDate) {
    const isExpired = moment(license.ExpiryDate).isBefore(moment());
    timelineItems.push({
      color: isExpired ? 'red' : 'orange',
      dot: isExpired ? <WarningOutlined /> : <ClockCircleOutlined />,
      label: moment(license.ExpiryDate).format('YYYY-MM-DD'),
      children: (
        <>
          <Text strong>{isExpired ? '已过期' : '到期日期'}</Text>
          <br />
          <Tag color={getStatusColor(license.LicenseStatus)}>
            {license.LicenseStatus === 'ACTIVE' && '有效'}
            {license.LicenseStatus === 'EXPIRED' && '已过期'}
            {license.LicenseStatus === 'TERMINATED' && '已终止'}
            {license.LicenseStatus === 'PENDING' && '待激活'}
          </Tag>
          {!isExpired && (
            <div>
              <Text type="secondary">
                距离到期还有 {moment(license.ExpiryDate).diff(moment(), 'days')} 天
              </Text>
            </div>
          )}
        </>
      )
    });
  }

  return (
    <Card title="许可证生命周期" bordered={false}>
      <Timeline
        mode="left"
        items={timelineItems}
      />
      <Divider />
      <Title level={5}>许可证状态说明</Title>
      <div style={{ marginBottom: 16 }}>
        <Tag color="gold">待激活</Tag>
        <Tag color="green">有效</Tag>
        <Tag color="red">已过期</Tag>
        <Tag color="volcano">已终止</Tag>
      </div>
      
      <Title level={5}>部署状态说明</Title>
      <div>
        <Tag color="gold">计划部署</Tag>
        <Tag color="blue">部署中</Tag>
        <Tag color="green">部署完成</Tag>
        <Tag color="red">部署失败</Tag>
      </div>
    </Card>
  );
};

export default LicenseLifecycle;
