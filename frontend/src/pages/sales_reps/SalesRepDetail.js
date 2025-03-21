import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Descriptions, Badge, Tabs, Table, Statistic, 
  Row, Col, Button, Space, Tag, message, Avatar, Spin, Divider, Empty
} from 'antd';
import { 
  UserOutlined, PhoneOutlined, MailOutlined, TeamOutlined, 
  EditOutlined, KeyOutlined, DollarOutlined, RiseOutlined,
  BarChartOutlined, CalendarOutlined, ClockCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SalesRepDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salesRep, setSalesRep] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [licenseStats, setLicenseStats] = useState({
    active: 0,
    expired: 0,
    pending: 0,
    total: 0
  });

  // 获取销售人员详情
  useEffect(() => {
    const fetchSalesRep = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/sales-reps/${id}`);
        setSalesRep(response.data);
      } catch (error) {
        message.error('获取销售人员信息失败');
        console.error('获取销售人员信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLicenses = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/sales-reps/${id}/licenses`);
        setLicenses(response.data);
        
        // 计算统计数据
        const stats = {
          active: 0,
          expired: 0,
          pending: 0,
          total: response.data.length
        };
        
        response.data.forEach(license => {
          if (license.LicenseStatus === 'ACTIVE') stats.active++;
          else if (license.LicenseStatus === 'EXPIRED') stats.expired++;
          else if (license.LicenseStatus === 'PENDING') stats.pending++;
        });
        
        setLicenseStats(stats);
      } catch (error) {
        message.error('获取相关许可证失败');
        console.error('获取许可证失败:', error);
      }
    };

    const fetchPerformance = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/sales-reps/${id}/performance`);
        setPerformance(response.data);
      } catch (error) {
        message.error('获取销售业绩数据失败');
        console.error('获取销售业绩失败:', error);
      }
    };

    fetchSalesRep();
    fetchLicenses();
    fetchPerformance();
  }, [id]);

  // 打开许可证详情页
  const goToLicenseDetail = (licenseId) => {
    navigate(`/licenses/${licenseId}`);
  };

  // 返回到销售人员列表
  const goBackToList = () => {
    navigate('/sales-reps');
  };

  // 许可证列表列定义
  const licenseColumns = [
    {
      title: '许可证ID',
      dataIndex: 'LicenseID',
      key: 'LicenseID',
      render: (text) => (
        <Space>
          <KeyOutlined />
          <a href={`/licenses/${text}`} onClick={(e) => { e.preventDefault(); goToLicenseDetail(text); }}>{text}</a>
        </Space>
      ),
    },
    {
      title: '客户',
      dataIndex: ['Customer', 'CustomerName'],
      key: 'CustomerName',
    },
    {
      title: '产品',
      dataIndex: 'ProductName',
      key: 'ProductName',
    },
    {
      title: '许可类型',
      dataIndex: 'LicenseType',
      key: 'LicenseType',
    },
    {
      title: '开始日期',
      dataIndex: 'StartDate',
      key: 'StartDate',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: '到期日期',
      dataIndex: 'ExpiryDate',
      key: 'ExpiryDate',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: '状态',
      dataIndex: 'LicenseStatus',
      key: 'LicenseStatus',
      render: (status) => {
        const statusMap = {
          ACTIVE: { color: 'green', text: '激活' },
          EXPIRED: { color: 'red', text: '过期' },
          PENDING: { color: 'gold', text: '待激活' },
          TERMINATED: { color: 'gray', text: '终止' },
        };
        
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        
        return <Badge status={color} text={text} />;
      },
    },
    {
      title: '工作区数',
      dataIndex: 'AuthorizedWorkspaces',
      key: 'AuthorizedWorkspaces',
      render: (text, record) => (
        <Space>
          <span>{record.ActualWorkspaces}</span>
          <span>/</span>
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '用户数',
      dataIndex: 'AuthorizedUsers',
      key: 'AuthorizedUsers',
      render: (text, record) => (
        <Space>
          <span>{record.ActualUsers}</span>
          <span>/</span>
          <span>{text}</span>
        </Space>
      ),
    },
  ];

  // 销售记录列定义
  const salesColumns = [
    {
      title: '日期',
      dataIndex: 'SaleDate',
      key: 'SaleDate',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: '许可证ID',
      dataIndex: 'LicenseID',
      key: 'LicenseID',
      render: (text) => (
        <a href={`/licenses/${text}`} onClick={(e) => { e.preventDefault(); goToLicenseDetail(text); }}>{text}</a>
      ),
    },
    {
      title: '客户',
      dataIndex: 'CustomerName',
      key: 'CustomerName',
    },
    {
      title: '金额',
      dataIndex: 'Amount',
      key: 'Amount',
      render: (text) => `$${text.toFixed(2)}`,
    },
    {
      title: '类型',
      dataIndex: 'SaleType',
      key: 'SaleType',
      render: (type) => {
        const typeColors = {
          NEW: { color: 'green', text: '新购' },
          RENEWAL: { color: 'blue', text: '续费' },
          UPGRADE: { color: 'purple', text: '升级' },
          EXPANSION: { color: 'orange', text: '扩展' },
        };
        
        const { color, text } = typeColors[type] || { color: 'default', text: type };
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!salesRep) {
    return (
      <Empty 
        description="未找到销售人员信息" 
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={goBackToList}>返回列表</Button>
      </Empty>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col>
          <Button icon={<ArrowLeftOutlined />} onClick={goBackToList}>
            返回列表
          </Button>
        </Col>
      </Row>

      <Card>
        <Row gutter={[24, 24]} align="middle">
          <Col sm={24} md={4} style={{ textAlign: 'center' }}>
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1890ff' }}
            />
          </Col>
          <Col sm={24} md={20}>
            <Title level={2}>{salesRep.SalesRepName}</Title>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
              <Descriptions.Item label="ID">
                {salesRep.SalesRepID}
              </Descriptions.Item>
              <Descriptions.Item label="电子邮箱">
                <Space>
                  <MailOutlined />
                  <Text copyable>{salesRep.Email}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="电话">
                <Space>
                  <PhoneOutlined />
                  <Text copyable>{salesRep.Phone || '未设置'}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="部门">
                <Space>
                  <TeamOutlined />
                  <Text>{salesRep.Department || '未设置'}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="职位">
                {salesRep.Position || '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge 
                  status={salesRep.Status === 'ACTIVE' ? 'success' : 'default'} 
                  text={salesRep.Status === 'ACTIVE' ? '在职' : '离职'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                <Space>
                  <CalendarOutlined />
                  <Text>{new Date(salesRep.CreatedAt).toLocaleDateString()}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="最后更新">
                <Space>
                  <ClockCircleOutlined />
                  <Text>{new Date(salesRep.UpdatedAt).toLocaleDateString()}</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="管理许可证总数"
              value={licenseStats.total}
              prefix={<KeyOutlined />}
              suffix="张"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃许可证"
              value={licenseStats.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<RiseOutlined />}
              suffix="张"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="即将到期"
              value={performance?.ExpiringLicenses || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
              suffix="张"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总销售额"
              value={performance?.TotalRevenue || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="$"
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Tabs defaultActiveKey="licenses">
        <TabPane 
          tab={
            <span>
              <KeyOutlined />
              许可证管理
            </span>
          } 
          key="licenses"
        >
          <Table 
            columns={licenseColumns}
            dataSource={licenses}
            rowKey="LicenseID"
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <DollarOutlined />
              销售业绩
            </span>
          } 
          key="performance"
        >
          <Card title="月度销售业绩" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="本月销售额"
                  value={performance?.RevenueThisMonth || 0}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="本月新增许可证"
                  value={performance?.NewLicensesThisMonth || 0}
                  suffix="张"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="本月新增客户"
                  value={performance?.NewCustomersThisMonth || 0}
                  suffix="个"
                />
              </Col>
            </Row>
          </Card>
          
          <Card title="销售历史记录">
            <Table 
              columns={salesColumns}
              dataSource={performance?.RecentSales || []}
              rowKey={(record, index) => `${record.LicenseID}_${index}`}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
              }}
            />
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BarChartOutlined />
              销售趋势
            </span>
          } 
          key="trends"
        >
          {performance ? (
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="销售额趋势（近半年）">
                  {/* 这里可以接入图表组件展示趋势数据 */}
                  <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Text type="secondary">图表组件暂未实现，这里将展示销售额趋势图</Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="销售类型分布">
                  <div style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Text type="secondary">图表组件暂未实现，这里将展示销售类型饼图</Text>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="客户区域分布">
                  <div style={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Text type="secondary">图表组件暂未实现，这里将展示客户地域分布图</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          ) : (
            <Empty description="暂无销售趋势数据" />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SalesRepDetail;
