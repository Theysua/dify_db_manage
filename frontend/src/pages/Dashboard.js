import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DisconnectOutlined,
  KeyOutlined,
  ReloadOutlined,
  RocketOutlined,
  UserOutlined,
  LineChartOutlined,
  AppstoreOutlined,
  SyncOutlined,
  ToolOutlined
} from '@ant-design/icons';
import '../styles/AppleStyle.css';
import { Alert, Button, Card, Col, Divider, Result, Row, Spin, Statistic, Table, Typography } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getConnectionStatus, retryConnection } from '../utils/connectionCheck';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [licenseStats, setLicenseStats] = useState(null);
  const [deploymentStats, setDeploymentStats] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [error, setError] = useState(null);
  const [recentLicenses, setRecentLicenses] = useState([]);
  const [recentDeployments, setRecentDeployments] = useState([]);

  // 手动刷新数据
  const handleRefresh = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 配置请求选项，添加超时
        const axiosOptions = {
          timeout: 5000 // 5秒超时
        };

        // 所有API请求都使用Promise.all并行执行
        const [deploymentsRes, licenseRes, customerRes, recentLicensesRes, recentDeploymentsRes] = await Promise.all([
          axios.get('/api/v1/deployments/statistics', axiosOptions),
          axios.get('/api/v1/licenses/statistics/overview', axiosOptions),
          axios.get('/api/v1/customers/statistics/overview', axiosOptions),
          axios.get('/api/v1/licenses?limit=5', axiosOptions),
          axios.get('/api/v1/deployments?limit=5', axiosOptions)
        ]);

        // 设置获取到的数据
        setDeploymentStats(deploymentsRes.data);
        setLicenseStats(licenseRes.data);
        setCustomerStats(customerRes.data);
        setRecentLicenses(recentLicensesRes.data);
        setRecentDeployments(recentDeploymentsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // 设置更具体的错误信息
      let errorMessage = '获取数据失败，请稍后再试';
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMessage = '请求超时，后端服务可能暂时不可用';
      } else if (err.response) {
        errorMessage = `服务器错误 (${err.response.status}): ${err.response.data?.detail || err.response.statusText}`;
      } else if (err.request) {
        errorMessage = '无法连接到后端服务，请确保服务已启动';
      }
      
      setError(errorMessage);
      
      // 使用模拟数据用于展示
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

  // useEffect to fetch data on component mount and set up periodic refresh
  useEffect(() => {
    // 首次加载时获取数据
    handleRefresh();
    
    // 设置定时刷新（如果后端连接正常）
    const refreshInterval = setInterval(() => {
      if (getConnectionStatus()) {
        handleRefresh();
      }
    }, 60000); // 每分钟刷新一次
    
    // 组件卸载时清除定时器
    return () => clearInterval(refreshInterval);
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

  // 处理重新连接
  const handleRetryConnection = async () => {
    const success = await retryConnection();
    if (success) {
      handleRefresh();
    }
  };

  // 显示连接错误
  if (error && !getConnectionStatus()) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        backgroundColor: 'var(--apple-bg)' 
      }}>
        <div style={{ 
          backgroundColor: 'var(--apple-card)', 
          borderRadius: '16px', 
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--apple-shadow-md)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <DisconnectOutlined style={{ fontSize: '48px', color: 'var(--apple-danger)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '500', marginBottom: '8px' }}>后端连接失败</h2>
          <p style={{ color: 'var(--apple-text-secondary)', marginBottom: '24px' }}>{error}</p>
          <Button 
            type="primary" 
            key="retry" 
            icon={<ReloadOutlined />} 
            onClick={handleRetryConnection}
            className="apple-button apple-button-primary"
            style={{ height: '40px', padding: '0 24px' }}
          >
            重试连接
          </Button>
        </div>
      </div>
    );
  }

  // 显示加载中
  if (loading && !licenseStats) {
    return (
      <div className="apple-loader">
        <Spin size="large" tip={<span style={{ marginTop: '16px', color: 'var(--apple-text-secondary)' }}>加载中...</span>} />
      </div>
    );
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

      <Divider className="apple-divider" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={3} className="apple-title" style={{ margin: 0 }}>数据概览</Title>
        <div>
          <Button 
            type="text" 
            icon={<AppstoreOutlined />} 
            className="apple-button"
            style={{ marginRight: '8px' }}
          >
            看板视图
          </Button>
          <Button 
            type="text" 
            icon={<LineChartOutlined />} 
            className="apple-button"
          >
            统计分析
          </Button>
        </div>
      </div>
      
      <Row gutter={24}>
        <Col span={12}>
          <Card 
            title={<span style={{ fontSize: '16px', fontWeight: '500' }}>最近许可证</span>} 
            className="apple-card" 
            bordered={false}
            headStyle={{ borderBottom: '1px solid var(--apple-border)' }}
            bodyStyle={{ padding: '0' }}
            extra={<a href="#" style={{ color: 'var(--apple-primary)' }}>查看全部</a>}
          >
            <Table 
              dataSource={recentLicenses} 
              columns={licenseColumns.map(col => {
                if (col.key === 'LicenseStatus') {
                  return {
                    ...col,
                    render: (status) => {
                      if (status === 'ACTIVE') 
                        return <span className="apple-badge apple-badge-success">有效</span>;
                      if (status === 'EXPIRED') 
                        return <span className="apple-badge apple-badge-danger">已过期</span>;
                      if (status === 'PENDING') 
                        return <span className="apple-badge apple-badge-warning">待激活</span>;
                      return status;
                    }
                  };
                }
                return col;
              })} 
              rowKey="LicenseID"
              pagination={false}
              size="small"
              className="apple-table"
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card 
            title={<span style={{ fontSize: '16px', fontWeight: '500' }}>最近部署</span>} 
            className="apple-card" 
            bordered={false}
            headStyle={{ borderBottom: '1px solid var(--apple-border)' }}
            bodyStyle={{ padding: '0' }}
            extra={<a href="#" style={{ color: 'var(--apple-primary)' }}>查看全部</a>}
          >
            <Table 
              dataSource={recentDeployments}
              columns={deploymentColumns.map(col => {
                if (col.key === 'DeploymentStatus') {
                  return {
                    ...col,
                    render: (status) => {
                      if (status === 'COMPLETED') 
                        return <span className="apple-badge apple-badge-success">已完成</span>;
                      if (status === 'PLANNED') 
                        return <span className="apple-badge apple-badge-info">已计划</span>;
                      if (status === 'IN_PROGRESS') 
                        return <span className="apple-badge apple-badge-warning">进行中</span>;
                      if (status === 'FAILED') 
                        return <span className="apple-badge apple-badge-danger">失败</span>;
                      return status;
                    }
                  };
                }
                return col;
              })}
              rowKey="DeploymentID"
              pagination={false}
              size="small"
              className="apple-table"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
