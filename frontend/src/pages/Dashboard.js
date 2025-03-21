import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Typography, Table, Divider } from 'antd';
import { 
  DashboardOutlined, 
  KeyOutlined, 
  RocketOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [licenseStats, setLicenseStats] = useState(null);
  const [deploymentStats, setDeploymentStats] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [error, setError] = useState(null);
  const [recentLicenses, setRecentLicenses] = useState([]);
  const [recentDeployments, setRecentDeployments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Would implement these endpoints on the backend
        const [deploymentsRes, licenseRes, customerRes, recentLicensesRes, recentDeploymentsRes] = await Promise.all([
          axios.get('/api/v1/deployments/statistics'),
          axios.get('/api/v1/licenses/statistics'), // This endpoint needs to be implemented
          axios.get('/api/v1/customers/statistics'), // This endpoint needs to be implemented
          axios.get('/api/v1/licenses?limit=5'), // Get recent licenses
          axios.get('/api/v1/deployments?limit=5') // Get recent deployments
        ]);

        setDeploymentStats(deploymentsRes.data);
        setLicenseStats(licenseRes.data);
        setCustomerStats(customerRes.data);
        setRecentLicenses(recentLicensesRes.data);
        setRecentDeployments(recentDeploymentsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('获取数据失败，请稍后再试。');
        // Use mock data for demonstration
        setDeploymentStats({
          TotalDeployments: 25,
          CompletedDeployments: 18,
          PlannedDeployments: 5,
          FailedDeployments: 2,
          AverageDeploymentTime: 3.5,
          DeploymentsByType: { 
            INITIAL: 15, 
            UPDATE: 7,
            MIGRATION: 2,
            REINSTALLATION: 1
          }
        });
        setLicenseStats({
          TotalLicenses: 42,
          ActiveLicenses: 35,
          ExpiredLicenses: 5,
          PendingLicenses: 2,
          ExpiringThisMonth: 3
        });
        setCustomerStats({
          TotalCustomers: 28,
          ActiveCustomers: 25,
          InactiveCustomers: 3,
          NewThisMonth: 2
        });
        setRecentLicenses([
          { LicenseID: 'ENT-2025-001', CustomerName: '测试客户1', ProductName: '产品A', StartDate: '2025-01-01', ExpiryDate: '2026-01-01', LicenseStatus: 'ACTIVE' },
          { LicenseID: 'ENT-2025-002', CustomerName: '测试客户2', ProductName: '产品B', StartDate: '2025-02-01', ExpiryDate: '2026-02-01', LicenseStatus: 'ACTIVE' }
        ]);
        setRecentDeployments([
          { DeploymentID: 1, LicenseID: 'ENT-2025-001', DeploymentType: 'INITIAL', DeploymentDate: '2025-01-15', DeploymentStatus: 'COMPLETED' },
          { DeploymentID: 2, LicenseID: 'ENT-2025-002', DeploymentType: 'INITIAL', DeploymentDate: '2025-02-15', DeploymentStatus: 'PLANNED' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const licenseColumns = [
    {
      title: '许可证ID',
      dataIndex: 'LicenseID',
      key: 'LicenseID',
    },
    {
      title: '客户名称',
      dataIndex: 'CustomerName',
      key: 'CustomerName',
    },
    {
      title: '产品',
      dataIndex: 'ProductName',
      key: 'ProductName',
    },
    {
      title: '开始日期',
      dataIndex: 'StartDate',
      key: 'StartDate',
    },
    {
      title: '到期日期',
      dataIndex: 'ExpiryDate',
      key: 'ExpiryDate',
    },
    {
      title: '状态',
      dataIndex: 'LicenseStatus',
      key: 'LicenseStatus',
      render: (status) => {
        if (status === 'ACTIVE') return <span style={{ color: 'green' }}>有效</span>;
        if (status === 'EXPIRED') return <span style={{ color: 'red' }}>已过期</span>;
        if (status === 'PENDING') return <span style={{ color: 'orange' }}>待激活</span>;
        return status;
      }
    },
  ];

  const deploymentColumns = [
    {
      title: '部署ID',
      dataIndex: 'DeploymentID',
      key: 'DeploymentID',
    },
    {
      title: '许可证ID',
      dataIndex: 'LicenseID',
      key: 'LicenseID',
    },
    {
      title: '部署类型',
      dataIndex: 'DeploymentType',
      key: 'DeploymentType',
      render: (type) => {
        if (type === 'INITIAL') return '初始部署';
        if (type === 'UPDATE') return '更新';
        if (type === 'MIGRATION') return '迁移';
        if (type === 'REINSTALLATION') return '重新安装';
        return type;
      }
    },
    {
      title: '部署日期',
      dataIndex: 'DeploymentDate',
      key: 'DeploymentDate',
    },
    {
      title: '状态',
      dataIndex: 'DeploymentStatus',
      key: 'DeploymentStatus',
      render: (status) => {
        if (status === 'COMPLETED') return <span style={{ color: 'green' }}>已完成</span>;
        if (status === 'PLANNED') return <span style={{ color: 'blue' }}>已计划</span>;
        if (status === 'IN_PROGRESS') return <span style={{ color: 'orange' }}>进行中</span>;
        if (status === 'FAILED') return <span style={{ color: 'red' }}>失败</span>;
        return status;
      }
    },
  ];

  if (loading) {
    return <Spin size="large" tip="加载中..." />;
  }

  return (
    <div className="dashboard-container">
      <Title level={2}>仪表盘</Title>
      
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '24px' }} />}
      
      <Row gutter={16}>
        <Col span={8}>
          <Card className="dashboard-card">
            <Statistic
              title="总许可证数"
              value={licenseStats?.TotalLicenses || 0}
              prefix={<KeyOutlined />}
              className="dashboard-statistic"
            />
            <Row gutter={16} style={{ marginTop: '20px' }}>
              <Col span={8}>
                <Statistic 
                  title="有效" 
                  value={licenseStats?.ActiveLicenses || 0} 
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                  className="dashboard-statistic"
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="已过期" 
                  value={licenseStats?.ExpiredLicenses || 0} 
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                  className="dashboard-statistic"
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="待激活" 
                  value={licenseStats?.PendingLicenses || 0}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                  className="dashboard-statistic"
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card className="dashboard-card">
            <Statistic
              title="部署总数"
              value={deploymentStats?.TotalDeployments || 0}
              prefix={<RocketOutlined />}
              className="dashboard-statistic"
            />
            <Row gutter={16} style={{ marginTop: '20px' }}>
              <Col span={8}>
                <Statistic 
                  title="已完成" 
                  value={deploymentStats?.CompletedDeployments || 0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                  className="dashboard-statistic"
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="已计划" 
                  value={deploymentStats?.PlannedDeployments || 0}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<ClockCircleOutlined />}
                  className="dashboard-statistic"
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="失败" 
                  value={deploymentStats?.FailedDeployments || 0}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                  className="dashboard-statistic"
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card className="dashboard-card">
            <Statistic
              title="客户总数"
              value={customerStats?.TotalCustomers || 0}
              prefix={<UserOutlined />}
              className="dashboard-statistic"
            />
            <Row gutter={16} style={{ marginTop: '20px' }}>
              <Col span={12}>
                <Statistic 
                  title="活跃客户" 
                  value={customerStats?.ActiveCustomers || 0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                  className="dashboard-statistic"
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="本月新增" 
                  value={customerStats?.NewThisMonth || 0}
                  valueStyle={{ color: '#1890ff' }}
                  className="dashboard-statistic"
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider />
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="最近许可证" className="dashboard-card">
            <Table 
              dataSource={recentLicenses} 
              columns={licenseColumns} 
              rowKey="LicenseID"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="最近部署" className="dashboard-card">
            <Table 
              dataSource={recentDeployments}
              columns={deploymentColumns}
              rowKey="DeploymentID"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
