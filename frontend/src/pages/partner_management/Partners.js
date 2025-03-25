import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  Tag,
  Button,
  Card,
  Input,
  Space,
  Select,
  message,
  Typography,
  Divider,
  Row,
  Col,
  Modal,
  Form,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../services/config';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    region: ''
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  
  // Regions for filter dropdown
  const regions = ['华东', '华南', '华北', '华中', '西南', '西北', '东北', '国际'];
  
  // Partner status options
  const statusOptions = [
    { value: 'ACTIVE', label: '活跃', color: 'success' },
    { value: 'INACTIVE', label: '非活跃', color: 'default' },
    { value: 'PENDING', label: '待审核', color: 'warning' },
    { value: 'SUSPENDED', label: '已暂停', color: 'error' }
  ];

  // Fetch partners with pagination and filters
  const fetchPartners = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => 
        (params[key] === '' || params[key] === undefined) && delete params[key]
      );

      const response = await axios.get(`${API_BASE_URL}/admin/partners`, { params });
      
      setPartners(response.data);
      setPagination({
        ...pagination,
        current: page,
        pageSize,
        total: response.headers['x-total-count'] || response.data.length
      });
    } catch (error) {
      console.error('Error fetching partners:', error);
      message.error('加载合作伙伴数据失败');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPartners(pagination.current, pagination.pageSize);
  }, [filters]);

  // Handle table change (pagination, filters)
  const handleTableChange = (pagination) => {
    fetchPartners(pagination.current, pagination.pageSize);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      current: 1
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      status: '',
      region: ''
    });
  };

  // Edit partner
  const handleEditPartner = (partner) => {
    setCurrentPartner(partner);
    form.setFieldsValue({
      PartnerName: partner.PartnerName,
      ContactPerson: partner.ContactPerson,
      Email: partner.Email,
      Phone: partner.Phone,
      Address: partner.Address,
      Region: partner.Region,
      Status: partner.Status,
      PartnerLevel: partner.PartnerLevel,
      Notes: partner.Notes
    });
    setEditModalVisible(true);
  };

  // Submit partner edit
  const handleSubmitEdit = async (values) => {
    if (!currentPartner) return;
    
    setSubmitting(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/partners/${currentPartner.PartnerId}`, values);
      
      // Update local data
      setPartners(partners.map(partner => 
        partner.PartnerId === currentPartner.PartnerId ? response.data : partner
      ));
      
      message.success('合作伙伴信息已更新');
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating partner:', error);
      message.error('更新合作伙伴信息失败');
    } finally {
      setSubmitting(false);
    }
  };

  // Table columns definition
  const columns = [
    {
      title: '合作伙伴名称',
      dataIndex: 'PartnerName',
      key: 'PartnerName',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: '联系人',
      dataIndex: 'ContactPerson',
      key: 'ContactPerson',
    },
    {
      title: '联系方式',
      dataIndex: 'Email',
      key: 'Email',
      render: (email, record) => (
        <>
          <div>{email}</div>
          {record.Phone && <div>{record.Phone}</div>}
        </>
      ),
    },
    {
      title: '区域',
      dataIndex: 'Region',
      key: 'Region',
    },
    {
      title: '合作级别',
      dataIndex: 'PartnerLevel',
      key: 'PartnerLevel',
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
      render: (status) => {
        const statusInfo = statusOptions.find(opt => opt.value === status) || 
                         { value: status, label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '订单数',
      dataIndex: 'OrderCount',
      key: 'OrderCount',
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="查看订单">
            <Button
              icon={<EyeOutlined />}
              size="small"
              component={Link}
              to={`/partner-management/partners/${record.PartnerId}/orders`}
            >
              订单
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditPartner(record)}
            >
              编辑
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>合作伙伴管理</Title>
      <Divider />

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              placeholder="合作伙伴状态"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => handleFilterChange('status', value)}
              value={filters.status}
            >
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="区域"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => handleFilterChange('region', value)}
              value={filters.region}
            >
              {regions.map(region => (
                <Option key={region} value={region}>{region}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Input 
              placeholder="搜索合作伙伴" 
              prefix={<SearchOutlined />}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              value={filters.query}
            />
          </Col>
          <Col span={6}>
            <Space>
              <Button 
                onClick={handleResetFilters}
              >
                重置筛选
              </Button>
              <Button 
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => fetchPartners(pagination.current, pagination.pageSize)}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          component={Link}
          to="/partner-management/partners/new"
        >
          添加合作伙伴
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={partners}
        rowKey="PartnerId"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />

      {/* Edit Partner Modal */}
      <Modal
        title="编辑合作伙伴信息"
        visible={editModalVisible}
        confirmLoading={submitting}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitEdit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="PartnerName"
                label="公司名称"
                rules={[{ required: true, message: '请输入合作伙伴公司名称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ContactPerson"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人姓名' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Email"
                label="电子邮箱"
                rules={[
                  { required: true, message: '请输入电子邮箱' },
                  { type: 'email', message: '邮箱格式不正确' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="Phone"
                label="联系电话"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Region"
                label="区域"
              >
                <Select>
                  {regions.map(region => (
                    <Option key={region} value={region}>{region}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="Status"
                label="状态"
                rules={[{ required: true, message: '请选择合作伙伴状态' }]}
              >
                <Select>
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="Address"
            label="公司地址"
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="PartnerLevel"
                label="合作级别"
              >
                <Select>
                  <Option value="金牌">金牌</Option>
                  <Option value="银牌">银牌</Option>
                  <Option value="铜牌">铜牌</Option>
                  <Option value="标准">标准</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="BusinessLicense"
                label="营业执照号"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="Notes"
            label="备注"
          >
            <TextArea rows={4} />
          </Form.Item>
          
          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Button 
                style={{ marginRight: 8 }} 
                onClick={() => setEditModalVisible(false)}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
              >
                保存
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Partners;
