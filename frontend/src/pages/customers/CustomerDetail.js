import React, { useState, useEffect, useContext } from 'react';
import { 
  Typography, Card, Row, Col, Tabs, Descriptions, Tag, Button, 
  Statistic, Timeline, Table, Space, Badge, Tooltip, Spin, Empty, 
  message, Divider, Avatar, List, Skeleton
} from 'antd';
import { 
  UserOutlined, GlobalOutlined, PhoneOutlined, MailOutlined, 
  TeamOutlined, BankOutlined, CalendarOutlined, ApartmentOutlined,
  KeyOutlined, CloudOutlined, FileProtectOutlined, SyncOutlined,
  EditOutlined, HistoryOutlined, ApiOutlined, AuditOutlined,
  DashboardOutlined, EnvironmentOutlined, BarChartOutlined,
  DownloadOutlined, PrinterOutlined, ShareAltOutlined, 
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { customerAPI } from '../../services/api';
import { ResponsiveGrid } from '../../components/common/ResponsiveLayout';
import { FadeIn } from '../../components/common/Transitions';
import { ThemeContext } from '../../context/ThemeContext';
import dayjs from 'dayjs';
import '../../styles/AppleStyle.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // 获取客户详情
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true);
        // 获取客户基本信息
        const response = await customerAPI.getById(id);
        setCustomer(response.data);
        
        // 这里需要额外API来获取相关数据
        // 模拟数据
        fetchRelatedData(id);
      } catch (error) {
        console.error('获取客户详情失败:', error);
        message.error('获取客户信息失败');
        // 模拟数据用于UI开发
        setCustomer({
          CustomerID: id,
          Name: '样例科技有限公司',
          Industry: '科技',
          Region: '亚太',
          Country: '中国',
          City: '上海',
          Address: '上海市浦东新区张江高科技园区科苑路88号',
          PostalCode: '201203',
          Website: 'https://example.tech.cn',
          CustomerType: '企业客户',
          Size: '中型企业',
          YearFounded: 2015,
          ContactPerson: '张三',
          ContactTitle: '技术总监',
          ContactEmail: 'zhang@example.tech.cn',
          ContactPhone: '+86 123 4567 8901',
          Status: 'ACTIVE',
          CreatedAt: '2023-08-15',
          LastUpdated: '2024-06-01',
          AnnualRevenue: '¥15,000,000',
          Description: '样例科技有限公司是一家专注于人工智能和大数据分析的技术公司，为企业提供智能化解决方案。',
          Notes: '客户对Dify平台的自定义功能特别感兴趣，计划在明年扩大使用规模。',
          Tags: ['AI', '大数据', 'VIP客户']  
        });
        fetchRelatedData(id);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  // 获取关联数据（许可证、部署记录等）
  const fetchRelatedData = async (customerId) => {
    // 模拟获取许可证信息
    setLicenses([
      {
        LicenseID: 'LIC-2024-001',
        ProductName: 'Dify Enterprise',
        PurchaseDate: '2024-01-15',
        ExpiryDate: '2025-01-14',
        Status: 'ACTIVE',
        Seats: 50,
        Cost: '¥500,000',
        RenewalType: '年度',
        Features: ['自定义模型', '高级API访问', '专属支持']
      },
      {
        LicenseID: 'LIC-2023-042',
        ProductName: 'Dify Professional',
        PurchaseDate: '2023-08-30',
        ExpiryDate: '2023-12-31',
        Status: 'EXPIRED',
        Seats: 20,
        Cost: '¥120,000',
        RenewalType: '季度',
        Features: ['基础功能']
      }
    ]);

    // 模拟获取部署记录
    setDeployments([
      {
        DeploymentID: 'DEP-2024-005',
        Type: '云部署',
        Version: 'v2.5.1',
        DeployDate: '2024-02-10',
        Status: 'RUNNING',
        Environment: '生产环境',
        Server: 'AWS-APAC-SH-001',
        UpdatedBy: '李工程师'
      },
      {
        DeploymentID: 'DEP-2023-112',
        Type: '本地部署',
        Version: 'v2.3.0',
        DeployDate: '2023-09-05',
        Status: 'SHUTDOWN',
        Environment: '测试环境',
        Server: '内部测试服务器',
        UpdatedBy: '王工程师'
      }
    ]);

    // 模拟获取联系人
    setContacts([
      {
        ContactID: 1,
        Name: '张三',
        Title: '技术总监',
        Email: 'zhang@example.tech.cn',
        Phone: '+86 123 4567 8901',
        IsPrimary: true
      },
      {
        ContactID: 2,
        Name: '李四',
        Title: '采购经理',
        Email: 'li@example.tech.cn',
        Phone: '+86 123 4567 8902',
        IsPrimary: false
      },
      {
        ContactID: 3,
        Name: '王五',
        Title: 'CIO',
        Email: 'wang@example.tech.cn',
        Phone: '+86 123 4567 8903',
        IsPrimary: false
      }
    ]);

    // 模拟销售历史
    setSalesHistory([
      {
        TransactionID: 'TR-2024-001',
        Date: '2024-01-15',
        Type: '新购',
        Product: 'Dify Enterprise',
        Amount: '¥500,000',
        SalesRep: '赵销售',
        Status: '已完成'
      },
      {
        TransactionID: 'TR-2023-042',
        Date: '2023-08-30',
        Type: '新购',
        Product: 'Dify Professional',
        Amount: '¥120,000',
        SalesRep: '赵销售',
        Status: '已完成'
      },
      {
        TransactionID: 'TR-2023-099',
        Date: '2023-12-20',
        Type: '咨询服务',
        Product: 'Dify实施咨询',
        Amount: '¥50,000',
        SalesRep: '钱顾问',
        Status: '已完成'
      }
    ]);
  };

  // 处理返回按钮
  const handleBack = () => {
    navigate('/customers');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载客户信息中..." />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-detail-container">
        <div className="page-header" style={{ marginBottom: 16 }}>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginRight: 8 }}>
            返回列表
          </Button>
          <Title level={2}>客户详情</Title>
        </div>
        <Card>
          <Empty description="未找到客户信息" />
        </Card>
      </div>
    );
  }
  
  // 渲染客户状态标签
  const renderStatusTag = (status) => {
    if (status === 'ACTIVE') {
      return <Tag color="success">活跃</Tag>;
    } else if (status === 'INACTIVE') {
      return <Tag color="default">不活跃</Tag>;
    } else if (status === 'EXPIRED') {
      return <Tag color="error">已过期</Tag>;
    } else if (status === 'PENDING') {
      return <Tag color="warning">待处理</Tag>;
    } else if (status === 'RUNNING') {
      return <Tag color="processing">运行中</Tag>;
    } else if (status === 'SHUTDOWN') {
      return <Tag color="default">已关闭</Tag>;
    }
    return <Tag>{status}</Tag>;
  };

  return (
    <FadeIn>
      <div className="customer-detail-container" style={{ padding: '0 20px' }}>
        {/* 页面头部 */}
        <div className="page-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginRight: 8 }}>
              返回列表
            </Button>
            <Title level={2} style={{ margin: 0 }}>{customer.Name}</Title>
            {renderStatusTag(customer.Status)}
          </div>
          <div>
            <Space>
              <Button icon={<ShareAltOutlined />}>分享</Button>
              <Button icon={<PrinterOutlined />}>打印</Button>
              <Button type="primary" icon={<EditOutlined />}>编辑客户</Button>
            </Space>
          </div>
        </div>
        
        {/* 客户基本信息概览卡片 */}
        <Card className="overview-card" style={{ marginBottom: 24 }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={24} md={16}>
              <Descriptions
                title="基本信息"
                bordered
                column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
              >
                <Descriptions.Item label="客户名称">{customer.Name}</Descriptions.Item>
                <Descriptions.Item label="行业">{customer.Industry}</Descriptions.Item>
                <Descriptions.Item label="客户类型">{customer.CustomerType}</Descriptions.Item>
                <Descriptions.Item label="地区">{customer.Region}</Descriptions.Item>
                <Descriptions.Item label="国家/地区">{customer.Country}</Descriptions.Item>
                <Descriptions.Item label="城市">{customer.City}</Descriptions.Item>
                <Descriptions.Item label="详细地址" span={2}>{customer.Address}</Descriptions.Item>
                <Descriptions.Item label="邮编">{customer.PostalCode}</Descriptions.Item>
                <Descriptions.Item label="网站" span={2}>
                  <a href={customer.Website} target="_blank" rel="noopener noreferrer">
                    {customer.Website}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="成立年份">{customer.YearFounded}</Descriptions.Item>
                <Descriptions.Item label="主要联系人">{customer.ContactPerson}</Descriptions.Item>
                <Descriptions.Item label="职位">{customer.ContactTitle}</Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  <a href={`mailto:${customer.ContactEmail}`}>{customer.ContactEmail}</a>
                </Descriptions.Item>
                <Descriptions.Item label="电话">{customer.ContactPhone}</Descriptions.Item>
                <Descriptions.Item label="客户规模">{customer.Size}</Descriptions.Item>
                <Descriptions.Item label="年收入">{customer.AnnualRevenue}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{customer.CreatedAt}</Descriptions.Item>
                <Descriptions.Item label="最后更新">{customer.LastUpdated}</Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Card title="客户概览" bordered={false}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  <div style={{ marginTop: 8 }}>
                    <Text strong style={{ fontSize: 16 }}>{customer.Name}</Text>
                    <div>
                      {customer.Tags && customer.Tags.map(tag => (
                        <Tag key={tag} color="blue" style={{ margin: '4px' }}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic 
                      title="许可证" 
                      value={licenses.length} 
                      prefix={<KeyOutlined />} 
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="部署" 
                      value={deployments.length} 
                      prefix={<CloudOutlined />} 
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="联系人" 
                      value={contacts.length} 
                      prefix={<TeamOutlined />} 
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="交易记录" 
                      value={salesHistory.length} 
                      prefix={<HistoryOutlined />} 
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          
          {customer.Description && (
            <div style={{ marginTop: 16 }}>
              <Title level={4}>客户描述</Title>
              <Paragraph>{customer.Description}</Paragraph>
            </div>
          )}
          
          {customer.Notes && (
            <div style={{ marginTop: 16 }}>
              <Title level={4}>备注</Title>
              <Paragraph>{customer.Notes}</Paragraph>
            </div>
          )}
        </Card>
        
        {/* 详细信息标签页 */}
        <Card>
          <Tabs defaultActiveKey="licenses" onChange={setActiveTab}>
            <TabPane tab={<span><KeyOutlined />许可证</span>} key="licenses">
              <Table 
                dataSource={licenses} 
                rowKey="LicenseID"
                pagination={false}
                columns={[
                  {
                    title: '许可证ID',
                    dataIndex: 'LicenseID',
                    key: 'LicenseID',
                  },
                  {
                    title: '产品',
                    dataIndex: 'ProductName',
                    key: 'ProductName',
                  },
                  {
                    title: '购买日期',
                    dataIndex: 'PurchaseDate',
                    key: 'PurchaseDate',
                  },
                  {
                    title: '到期日期',
                    dataIndex: 'ExpiryDate',
                    key: 'ExpiryDate',
                  },
                  {
                    title: '状态',
                    dataIndex: 'Status',
                    key: 'Status',
                    render: status => renderStatusTag(status),
                  },
                  {
                    title: '用户数',
                    dataIndex: 'Seats',
                    key: 'Seats',
                  },
                  {
                    title: '费用',
                    dataIndex: 'Cost',
                    key: 'Cost',
                  },
                  {
                    title: '续期类型',
                    dataIndex: 'RenewalType',
                    key: 'RenewalType',
                  },
                  {
                    title: '功能',
                    dataIndex: 'Features',
                    key: 'Features',
                    render: features => (
                      <>
                        {features.map(feature => (
                          <Tag key={feature}>{feature}</Tag>
                        ))}
                      </>
                    ),
                  },
                ]}
                expandable={{
                  expandedRowRender: record => (
                    <p style={{ margin: 0 }}>
                      <strong>详细信息：</strong> {`${record.ProductName} - ${record.Seats}用户许可证，${record.RenewalType}续订`}
                    </p>
                  ),
                }}
              />
            </TabPane>
            
            <TabPane tab={<span><CloudOutlined />部署记录</span>} key="deployments">
              <Table 
                dataSource={deployments} 
                rowKey="DeploymentID"
                pagination={false}
                columns={[
                  {
                    title: '部署ID',
                    dataIndex: 'DeploymentID',
                    key: 'DeploymentID',
                  },
                  {
                    title: '类型',
                    dataIndex: 'Type',
                    key: 'Type',
                  },
                  {
                    title: '版本',
                    dataIndex: 'Version',
                    key: 'Version',
                  },
                  {
                    title: '部署日期',
                    dataIndex: 'DeployDate',
                    key: 'DeployDate',
                  },
                  {
                    title: '状态',
                    dataIndex: 'Status',
                    key: 'Status',
                    render: status => renderStatusTag(status),
                  },
                  {
                    title: '环境',
                    dataIndex: 'Environment',
                    key: 'Environment',
                  },
                  {
                    title: '服务器',
                    dataIndex: 'Server',
                    key: 'Server',
                  },
                  {
                    title: '操作人员',
                    dataIndex: 'UpdatedBy',
                    key: 'UpdatedBy',
                  },
                ]}
              />
            </TabPane>
            
            <TabPane tab={<span><TeamOutlined />联系人</span>} key="contacts">
              <List
                itemLayout="horizontal"
                dataSource={contacts}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button type="link" icon={<MailOutlined />} key="email" onClick={() => window.location.href = `mailto:${item.Email}`}>
                        发送邮件
                      </Button>,
                      <Button type="link" icon={<PhoneOutlined />} key="phone" onClick={() => window.location.href = `tel:${item.Phone}`}>
                        拨打电话
                      </Button>,
                      <Button type="link" icon={<EditOutlined />} key="edit">
                        编辑
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: item.IsPrimary ? '#1890ff' : '#d9d9d9' }} />}
                      title={<>
                        {item.Name} 
                        <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>{item.Title}</span>
                        {item.IsPrimary && <Tag color="blue" style={{ marginLeft: 8 }}>主要联系人</Tag>}
                      </>}
                      description={
                        <Space direction="vertical">
                          <Text><MailOutlined style={{ marginRight: 8 }} />{item.Email}</Text>
                          <Text><PhoneOutlined style={{ marginRight: 8 }} />{item.Phone}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>
            
            <TabPane tab={<span><HistoryOutlined />销售历史</span>} key="sales">
              <Timeline mode="left" style={{ margin: '20px 0' }}>
                {salesHistory.map(record => (
                  <Timeline.Item 
                    key={record.TransactionID}
                    label={record.Date}
                    color={record.Status === '已完成' ? 'green' : 'blue'}
                  >
                    <Card size="small" style={{ marginBottom: 0 }}>
                      <strong>{record.Type}:</strong> {record.Product}
                      <br />
                      <strong>金额:</strong> {record.Amount}
                      <br />
                      <strong>销售代表:</strong> {record.SalesRep}
                      <br />
                      <strong>状态:</strong> {renderStatusTag(record.Status)}
                      <br />
                      <strong>交易ID:</strong> {record.TransactionID}
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </FadeIn>
  );
};

export default CustomerDetail;
