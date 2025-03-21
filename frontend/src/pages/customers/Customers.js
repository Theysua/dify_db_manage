import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Table, 
  Space, 
  Input, 
  Form, 
  Select, 
  Modal, 
  message, 
  Spin,
  Row,
  Col,
  Tooltip,
  Tag,
  Popconfirm,
  Statistic
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AppleStyle.css';

const { Title } = Typography;
const { Option } = Select;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customerForm] = Form.useForm();
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  
  const navigate = useNavigate();

  // 获取客户统计信息
  const fetchCustomerStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.get('/api/v1/customers/statistics/overview');
      setStats(response.data || {});
    } catch (error) {
      console.error('获取客户统计数据失败:', error);
      // 模拟数据用于 UI 开发
      setStats({
        TotalCustomers: 125,
        ActiveCustomers: 98,
        NewThisMonth: 12,
        RegionDistribution: {
          北美: 35,
          欧洲: 42,
          亚太: 31,
          其他: 17
        },
        IndustryDistribution: {
          科技: 45,
          金融: 28,
          医疗: 18,
          教育: 15,
          其他: 19
        }
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // 获取客户列表
  const fetchCustomers = async (page = 1, size = 10, filters = {}) => {
    try {
      setLoading(true);
      const params = { 
        skip: (page - 1) * size, 
        limit: size,
        ...filters
      };
      
      const response = await axios.get('/api/v1/customers', { params });
      setCustomers(response.data || []);
      setTotal(response.headers['x-total-count'] || response.data.length);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error('获取客户列表失败:', error);
      // 模拟数据用于 UI 开发
      const mockData = [
        {
          CustomerID: 1,
          Name: 'ABC科技有限公司',
          Industry: '科技',
          Region: '亚太',
          CustomerType: '企业客户',
          ContactPerson: '张三',
          ContactEmail: 'zhangsan@abc-tech.com',
          ContactPhone: '+86 123 4567 8901',
          Status: 'ACTIVE',
          CreatedAt: '2024-12-01'
        },
        {
          CustomerID: 2,
          Name: 'XYZ金融服务集团',
          Industry: '金融',
          Region: '北美',
          CustomerType: '企业客户',
          ContactPerson: '李四',
          ContactEmail: 'lisi@xyz-finance.com',
          ContactPhone: '+1 987 654 3210',
          Status: 'ACTIVE',
          CreatedAt: '2025-01-15'
        },
        {
          CustomerID: 3,
          Name: '医疗科技创新公司',
          Industry: '医疗',
          Region: '欧洲',
          CustomerType: '初创企业',
          ContactPerson: '王五',
          ContactEmail: 'wangwu@medtech.eu',
          ContactPhone: '+44 555 123 4567',
          Status: 'INACTIVE',
          CreatedAt: '2025-02-20'
        }
      ];
      setCustomers(mockData);
      setTotal(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    fetchCustomers();
    fetchCustomerStats();
  }, []);

  // 处理搜索
  const handleSearch = (values) => {
    const filters = {};
    Object.keys(values).forEach(key => {
      if (values[key]) {
        filters[key] = values[key];
      }
    });
    fetchCustomers(1, pageSize, filters);
  };

  // 处理表格变化
  const handleTableChange = (pagination) => {
    fetchCustomers(pagination.current, pagination.pageSize, searchForm.getFieldsValue());
  };

  // 新建/编辑客户弹窗
  const showModal = (record = null) => {
    if (record) {
      setEditingCustomerId(record.CustomerID);
      customerForm.setFieldsValue({
        Name: record.Name,
        Industry: record.Industry,
        Region: record.Region,
        CustomerType: record.CustomerType,
        ContactPerson: record.ContactPerson,
        ContactEmail: record.ContactEmail,
        ContactPhone: record.ContactPhone,
        Status: record.Status,
      });
    } else {
      setEditingCustomerId(null);
      customerForm.resetFields();
      customerForm.setFieldsValue({ Status: 'ACTIVE' });
    }
    setIsModalVisible(true);
  };

  // 保存客户
  const handleSaveCustomer = async () => {
    try {
      const values = await customerForm.validateFields();
      const customerData = { ...values };
      
      let response;
      if (editingCustomerId) {
        response = await axios.put(`/api/v1/customers/${editingCustomerId}`, customerData);
        message.success('客户信息更新成功');
      } else {
        response = await axios.post('/api/v1/customers', customerData);
        message.success('新客户创建成功');
      }
      
      setIsModalVisible(false);
      fetchCustomers(currentPage, pageSize, searchForm.getFieldsValue());
      fetchCustomerStats();
    } catch (error) {
      console.error('保存客户信息失败:', error);
      message.error('保存失败，请检查输入并重试');
    }
  };

  // 删除客户
  const handleDeleteCustomer = async (id) => {
    try {
      await axios.delete(`/api/v1/customers/${id}`);
      message.success('客户删除成功');
      fetchCustomers(currentPage, pageSize, searchForm.getFieldsValue());
      fetchCustomerStats();
    } catch (error) {
      console.error('删除客户失败:', error);
      message.error('删除失败，请稍后重试');
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchCustomers(currentPage, pageSize, searchForm.getFieldsValue());
    fetchCustomerStats();
  };

  // 表格列定义
  const columns = [
    {
      title: '客户ID',
      dataIndex: 'CustomerID',
      key: 'CustomerID',
      sorter: (a, b) => a.CustomerID - b.CustomerID,
    },
    {
      title: '客户名称',
      dataIndex: 'Name',
      key: 'Name',
      render: (text, record) => (
        <a onClick={() => navigate(`/customers/${record.CustomerID}`)}>{text}</a>
      ),
    },
    {
      title: '行业',
      dataIndex: 'Industry',
      key: 'Industry',
      filters: [
        { text: '科技', value: '科技' },
        { text: '金融', value: '金融' },
        { text: '医疗', value: '医疗' },
        { text: '教育', value: '教育' },
        { text: '其他', value: '其他' },
      ],
      onFilter: (value, record) => record.Industry === value,
    },
    {
      title: '地区',
      dataIndex: 'Region',
      key: 'Region',
      filters: [
        { text: '北美', value: '北美' },
        { text: '欧洲', value: '欧洲' },
        { text: '亚太', value: '亚太' },
        { text: '其他', value: '其他' },
      ],
      onFilter: (value, record) => record.Region === value,
    },
    {
      title: '客户类型',
      dataIndex: 'CustomerType',
      key: 'CustomerType',
      filters: [
        { text: '企业客户', value: '企业客户' },
        { text: '政府机构', value: '政府机构' },
        { text: '教育机构', value: '教育机构' },
        { text: '初创企业', value: '初创企业' },
      ],
      onFilter: (value, record) => record.CustomerType === value,
    },
    {
      title: '联系人',
      dataIndex: 'ContactPerson',
      key: 'ContactPerson',
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_, record) => (
        <Space size="small">
          {record.ContactEmail && (
            <Tooltip title={record.ContactEmail}>
              <MailOutlined />
            </Tooltip>
          )}
          {record.ContactPhone && (
            <Tooltip title={record.ContactPhone}>
              <PhoneOutlined />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
      render: (status) => {
        if (status === 'ACTIVE') 
          return <Tag color="success" className="apple-badge apple-badge-success">活跃</Tag>;
        if (status === 'INACTIVE') 
          return <Tag color="default" className="apple-badge apple-badge-secondary">非活跃</Tag>;
        return status;
      },
      filters: [
        { text: '活跃', value: 'ACTIVE' },
        { text: '非活跃', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.Status === value,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/customers/${record.CustomerID}`)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="确定删除该客户吗？"
            description="删除后无法恢复，关联的许可证也会被删除"
            onConfirm={() => handleDeleteCustomer(record.CustomerID)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="customers-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} className="apple-title">客户管理</Title>
        <Button 
          onClick={handleRefresh} 
          icon={<SyncOutlined />} 
          type="primary"
          className="apple-button apple-button-primary"
          style={{ borderRadius: '20px', height: '36px' }}
        >
          刷新数据
        </Button>
      </div>
      
      {/* 统计卡片 */}
      <Row gutter={24} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card className="apple-card apple-stats-card" bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'rgba(52, 199, 89, 0.1)', 
                borderRadius: '12px', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <TeamOutlined style={{ fontSize: '24px', color: 'var(--apple-success)' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <div style={{ fontSize: '14px', color: 'var(--apple-text-secondary)' }}>客户总数</div>
                <div style={{ fontSize: '28px', fontWeight: '600' }}>{stats?.TotalCustomers || 0}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="apple-card apple-stats-card" bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'rgba(0, 113, 227, 0.1)', 
                borderRadius: '12px', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <UserOutlined style={{ fontSize: '24px', color: 'var(--apple-primary)' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <div style={{ fontSize: '14px', color: 'var(--apple-text-secondary)' }}>活跃客户</div>
                <div style={{ fontSize: '28px', fontWeight: '600' }}>{stats?.ActiveCustomers || 0}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="apple-card apple-stats-card" bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'rgba(255, 149, 0, 0.1)', 
                borderRadius: '12px', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <GlobalOutlined style={{ fontSize: '24px', color: 'var(--apple-warning)' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <div style={{ fontSize: '14px', color: 'var(--apple-text-secondary)' }}>本月新增</div>
                <div style={{ fontSize: '28px', fontWeight: '600' }}>{stats?.NewThisMonth || 0}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 搜索表单 */}
      <Card className="apple-card" bordered={false} style={{ marginBottom: '24px' }}>
        <Form
          form={searchForm}
          layout="horizontal"
          onFinish={handleSearch}
          initialValues={{}}
        >
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="name" label="客户名称">
                <Input placeholder="输入客户名称" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="industry" label="行业">
                <Select placeholder="选择行业" allowClear>
                  <Option value="科技">科技</Option>
                  <Option value="金融">金融</Option>
                  <Option value="医疗">医疗</Option>
                  <Option value="教育">教育</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="region" label="地区">
                <Select placeholder="选择地区" allowClear>
                  <Option value="北美">北美</Option>
                  <Option value="欧洲">欧洲</Option>
                  <Option value="亚太">亚太</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    className="apple-button apple-button-primary"
                  >
                    搜索
                  </Button>
                  <Button 
                    onClick={() => {
                      searchForm.resetFields();
                      fetchCustomers();
                    }}
                    className="apple-button"
                  >
                    重置
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={() => showModal()}
                    icon={<PlusOutlined />}
                    className="apple-button apple-button-primary"
                  >
                    新建客户
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      
      {/* 客户列表 */}
      <Card className="apple-card" bordered={false}>
        <Table
          dataSource={customers}
          columns={columns}
          rowKey="CustomerID"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          loading={loading}
          onChange={handleTableChange}
          className="apple-table"
        />
      </Card>
      
      {/* 新建/编辑客户弹窗 */}
      <Modal
        title={editingCustomerId ? '编辑客户' : '新建客户'}
        open={isModalVisible}
        onOk={handleSaveCustomer}
        onCancel={() => setIsModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form
          form={customerForm}
          layout="vertical"
          initialValues={{ Status: 'ACTIVE' }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item 
                name="Name" 
                label="客户名称"
                rules={[{ required: true, message: '请输入客户名称' }]}
              >
                <Input placeholder="输入客户名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="Industry" 
                label="行业"
                rules={[{ required: true, message: '请选择行业' }]}
              >
                <Select placeholder="选择行业">
                  <Option value="科技">科技</Option>
                  <Option value="金融">金融</Option>
                  <Option value="医疗">医疗</Option>
                  <Option value="教育">教育</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item 
                name="Region" 
                label="地区"
                rules={[{ required: true, message: '请选择地区' }]}
              >
                <Select placeholder="选择地区">
                  <Option value="北美">北美</Option>
                  <Option value="欧洲">欧洲</Option>
                  <Option value="亚太">亚太</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="CustomerType" 
                label="客户类型"
                rules={[{ required: true, message: '请选择客户类型' }]}
              >
                <Select placeholder="选择客户类型">
                  <Option value="企业客户">企业客户</Option>
                  <Option value="政府机构">政府机构</Option>
                  <Option value="教育机构">教育机构</Option>
                  <Option value="初创企业">初创企业</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item 
                name="ContactPerson" 
                label="联系人"
                rules={[{ required: true, message: '请输入联系人姓名' }]}
              >
                <Input placeholder="输入联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="ContactEmail" 
                label="联系邮箱"
                rules={[
                  { required: true, message: '请输入联系邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="输入联系邮箱" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item 
                name="ContactPhone" 
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="Status" 
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="选择状态">
                  <Option value="ACTIVE">活跃</Option>
                  <Option value="INACTIVE">非活跃</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;
