import React from 'react';
import { 
  Card, 
  Descriptions, 
  Tag, 
  Row, 
  Col, 
  Typography,
  Divider,
  Table,
  Badge,
  Progress
} from 'antd';
import moment from 'moment';
import LicenseLifecycle from './LicenseLifecycle';

const { Title } = Typography;

/**
 * Component to display detailed license information
 * @param {Object} license - The license object with all details
 */
const LicenseDetail = ({ license }) => {
  if (!license) return null;
  
  const getStatusTag = (status) => {
    if (status === 'ACTIVE') {
      return <Tag color="green">有效</Tag>;
    } else if (status === 'EXPIRED') {
      return <Tag color="red">已过期</Tag>;
    } else if (status === 'TERMINATED') {
      return <Tag color="volcano">已终止</Tag>;
    } else if (status === 'PENDING') {
      return <Tag color="gold">待激活</Tag>;
    }
    return <Tag>{status}</Tag>;
  };
  
  const getDeploymentStatusTag = (status) => {
    if (status === 'COMPLETED') {
      return <Tag color="green">已完成</Tag>;
    } else if (status === 'IN_PROGRESS') {
      return <Tag color="blue">进行中</Tag>;
    } else if (status === 'PLANNED') {
      return <Tag color="gold">已计划</Tag>;
    } else if (status === 'FAILED') {
      return <Tag color="red">失败</Tag>;
    }
    return <Tag>{status}</Tag>;
  };

  // Calculate usage percentages
  const workspaceUsagePercent = license.AuthorizedWorkspaces > 0 
    ? Math.min(100, Math.round((license.ActualWorkspaces / license.AuthorizedWorkspaces) * 100)) 
    : 0;
  
  const userUsagePercent = license.AuthorizedUsers > 0 
    ? Math.min(100, Math.round((license.ActualUsers / license.AuthorizedUsers) * 100)) 
    : 0;
  
  // Usage color based on percentage
  const getUsageColor = (percent) => {
    if (percent >= 100) return '#f5222d'; // Red
    if (percent >= 80) return '#faad14';  // Orange
    return '#52c41a'; // Green
  };

  // Purchase record columns
  const purchaseColumns = [
    {
      title: '购买日期',
      dataIndex: 'PurchaseDate',
      key: 'PurchaseDate',
      render: date => moment(date).format('YYYY-MM-DD')
    },
    {
      title: '类型',
      dataIndex: 'PurchaseType',
      key: 'PurchaseType',
      render: type => {
        const types = {
          'NEW': <Tag color="green">新购</Tag>,
          'RENEWAL': <Tag color="blue">续期</Tag>,
          'UPGRADE': <Tag color="purple">升级</Tag>,
          'EXPANSION': <Tag color="geekblue">扩容</Tag>
        };
        return types[type] || type;
      }
    },
    {
      title: '订单号',
      dataIndex: 'OrderNumber',
      key: 'OrderNumber',
    },
    {
      title: '合同号',
      dataIndex: 'ContractNumber',
      key: 'ContractNumber',
    },
    {
      title: '金额',
      dataIndex: 'Amount',
      key: 'Amount',
      render: (amount, record) => `${amount} ${record.Currency}`
    },
    {
      title: '支付状态',
      dataIndex: 'PaymentStatus',
      key: 'PaymentStatus',
      render: status => {
        const statuses = {
          'PENDING': <Badge status="warning" text="待支付" />,
          'PAID': <Badge status="success" text="已支付" />,
          'REFUNDED': <Badge status="error" text="已退款" />,
          'CANCELLED': <Badge status="default" text="已取消" />
        };
        return statuses[status] || status;
      }
    }
  ];

  // Deployment record columns
  const deploymentColumns = [
    {
      title: '部署日期',
      dataIndex: 'DeploymentDate',
      key: 'DeploymentDate',
      render: date => moment(date).format('YYYY-MM-DD')
    },
    {
      title: '类型',
      dataIndex: 'DeploymentType',
      key: 'DeploymentType',
      render: type => {
        const types = {
          'INITIAL': <Tag color="green">初始部署</Tag>,
          'UPDATE': <Tag color="blue">更新</Tag>,
          'MIGRATION': <Tag color="purple">迁移</Tag>,
          'REINSTALLATION': <Tag color="orange">重新安装</Tag>
        };
        return types[type] || type;
      }
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
      render: status => getDeploymentStatusTag(status)
    },
    {
      title: '部署工程师',
      dataIndex: 'EngineerName',
      key: 'EngineerName'
    },
    {
      title: '完成日期',
      dataIndex: 'CompletionDate',
      key: 'CompletionDate',
      render: date => date ? moment(date).format('YYYY-MM-DD') : '-'
    }
  ];

  return (
    <div className="license-detail-container">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card bordered={false}>
            <Descriptions title={`许可证详情: ${license.LicenseID}`} bordered>
              <Descriptions.Item label="状态" span={3}>
                {getStatusTag(license.LicenseStatus)}
                {license.DeploymentStatus && (
                  <span style={{ marginLeft: 8 }}>
                    {getDeploymentStatusTag(license.DeploymentStatus)}
                  </span>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="客户名称" span={3}>
                {license.Customer ? license.Customer.CustomerName : license.CustomerName}
              </Descriptions.Item>
              
              <Descriptions.Item label="销售代表">
                {license.SalesRep ? license.SalesRep.SalesRepName : license.SalesRepName || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="代理商">
                {license.Reseller ? license.Reseller.ResellerName : license.ResellerName || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="产品">
                {license.ProductName || 'Dify Enterprise'}
              </Descriptions.Item>
              
              <Descriptions.Item label="许可类型">
                {license.LicenseType}
              </Descriptions.Item>
              
              <Descriptions.Item label="订单日期">
                {license.OrderDate ? moment(license.OrderDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="开始日期">
                {license.StartDate ? moment(license.StartDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="到期日期">
                {license.ExpiryDate ? moment(license.ExpiryDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="部署日期">
                {license.DeploymentDate ? moment(license.DeploymentDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="授权与使用情况" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>工作区使用情况</Title>
                  <Progress 
                    percent={workspaceUsagePercent} 
                    strokeColor={getUsageColor(workspaceUsagePercent)}
                    format={percent => (
                      <span>{license.ActualWorkspaces}/{license.AuthorizedWorkspaces}</span>
                    )}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Title level={5}>用户使用情况</Title>
                  <Progress 
                    percent={userUsagePercent} 
                    strokeColor={getUsageColor(userUsagePercent)}
                    format={percent => (
                      <span>{license.ActualUsers}/{license.AuthorizedUsers}</span>
                    )}
                  />
                </div>
              </Col>
            </Row>

            <Divider />
            
            <div>
              <Title level={5}>备注</Title>
              <p>{license.Notes || '无'}</p>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <LicenseLifecycle license={license} />
        </Col>

        {license.PurchaseRecords && license.PurchaseRecords.length > 0 && (
          <Col span={24}>
            <Card title="采购记录" bordered={false}>
              <Table 
                dataSource={license.PurchaseRecords} 
                columns={purchaseColumns} 
                rowKey="PurchaseID"
                pagination={false}
              />
            </Card>
          </Col>
        )}

        {license.DeploymentRecords && license.DeploymentRecords.length > 0 && (
          <Col span={24}>
            <Card title="部署记录" bordered={false}>
              <Table 
                dataSource={license.DeploymentRecords} 
                columns={deploymentColumns} 
                rowKey="DeploymentID"
                pagination={false}
              />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default LicenseDetail;
