import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Table,
  Tag,
  Button,
  Card,
  Space,
  Select,
  message,
  Typography,
  Divider,
  Tooltip,
  Row,
  Col,
  Alert,
  Modal,
  Form,
  Input,
  Popconfirm,
  Descriptions
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../services/config';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PartnerOrdersList = () => {
  const { partnerId } = useParams();
  // 确保partnerId作为整数传给后端API
  const partnerIdInt = partnerId ? parseInt(partnerId, 10) : null;
  const navigate = useNavigate();
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusForm] = Form.useForm();

  // 获取合作伙伴信息
  useEffect(() => {
    const fetchPartnerInfo = async () => {
      try {
        const token = localStorage.getItem('dify_token');
        const response = await axios.get(`${API_BASE_URL}/admin/partners/${partnerIdInt}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPartnerInfo(response.data);
      } catch (error) {
        console.error('获取合作伙伴信息失败:', error);
        message.error('无法加载合作伙伴信息');
      }
    };

    if (partnerId) {
      fetchPartnerInfo();
    }
  }, [partnerId]);

  // 获取合作伙伴的订单
  const fetchPartnerOrders = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        ...filters
      };

      // 移除空过滤器
      Object.keys(params).forEach(key => 
        (params[key] === '' || params[key] === undefined) && delete params[key]
      );

      const token = localStorage.getItem('dify_token');
      const response = await axios.get(`${API_BASE_URL}/admin/partners/${partnerIdInt}/orders`, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setOrders(response.data);
      setPagination({
        ...pagination,
        current: page,
        pageSize,
        total: response.headers['x-total-count'] || response.data.length
      });
    } catch (error) {
      console.error('获取订单列表失败:', error);
      message.error('无法加载订单数据');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    if (partnerId) {
      fetchPartnerOrders(pagination.current, pagination.pageSize);
    }
  }, [partnerId, filters]);

  // 处理表格变化（分页、筛选）
  const handleTableChange = (pagination) => {
    fetchPartnerOrders(pagination.current, pagination.pageSize);
  };

  // 更新订单状态
  const updateOrderStatus = async (orderId, status, comments) => {
    try {
      const token = localStorage.getItem('dify_token');
      await axios.put(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        status,
        comments
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      message.success(`订单状态已更新为${status}`);
      fetchPartnerOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('更新订单状态失败:', error);
      message.error('更新订单状态失败');
    }
  };

  // 取消订单
  const cancelOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'CANCELED', '管理员取消');
      message.success('订单已取消');
    } catch (error) {
      message.error('取消订单失败');
    }
  };

  // 打开状态更新对话框
  const showStatusModal = (order) => {
    setSelectedOrder(order);
    statusForm.setFieldsValue({
      status: order.Status,
      comments: ''
    });
    setStatusModalVisible(true);
  };

  // 处理状态更新提交
  const handleStatusUpdate = async () => {
    try {
      const values = await statusForm.validateFields();
      await updateOrderStatus(selectedOrder.OrderId, values.status, values.comments);
      setStatusModalVisible(false);
    } catch (error) {
      console.error('表单验证或提交失败:', error);
    }
  };

  // 处理过滤器变化
  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
    // 重置到第一页
    setPagination({
      ...pagination,
      current: 1
    });
  };

  // 重置所有过滤器
  const handleResetFilters = () => {
    setFilters({
      status: ''
    });
  };

  // 根据状态获取标签颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      case 'COMPLETED':
        return 'blue';
      case 'CANCELED':
        return 'default';
      case 'DRAFT':
        return 'processing';
      case 'CONFIRMED':
        return 'cyan';
      default:
        return 'default';
    }
  };

  // 状态选项
  const statusOptions = [
    { value: 'DRAFT', label: '草稿' },
    { value: 'CONFIRMED', label: '已确认' },
    { value: 'CANCELED', label: '已取消' },
    { value: 'PENDING', label: '审核中' },
    { value: 'APPROVED', label: '已批准' },
    { value: 'REJECTED', label: '已拒绝' },
    { value: 'COMPLETED', label: '已完成' }
  ];

  // 表格列定义
  const columns = [
    {
      title: '订单编号',
      dataIndex: 'OrderNumber',
      key: 'OrderNumber',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '订单日期',
      dataIndex: 'OrderDate',
      key: 'OrderDate',
      render: (date) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '总金额',
      dataIndex: 'TotalAmount',
      key: 'TotalAmount',
      align: 'right',
      render: (amount) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {statusOptions.find(opt => opt.value === status)?.label || status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="查看详情">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => navigate(`/partner-management/orders/${record.OrderId}`)}
            >
              详情
            </Button>
          </Tooltip>
          <Tooltip title="更新状态">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showStatusModal(record)}
            >
              修改状态
            </Button>
          </Tooltip>
          <Tooltip title="取消订单">
            <Popconfirm
              title="确定要取消此订单吗？"
              onConfirm={() => cancelOrder(record.OrderId)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="default"
                danger
                icon={<CloseOutlined />}
                size="small"
                disabled={record.Status === 'CANCELED'}
              >
                取消订单
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/partner-management/partners')}
        >
          返回合作伙伴列表
        </Button>
      </Space>

      {partnerInfo && (
        <>
          <Title level={2}>{partnerInfo.PartnerName} - 订单管理</Title>
          <Card style={{ marginBottom: 16 }}>
            <Descriptions title="合作伙伴信息" bordered column={2}>
              <Descriptions.Item label="联系人">{partnerInfo.ContactPerson || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系邮箱">{partnerInfo.ContactEmail || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{partnerInfo.ContactPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="合作等级">{partnerInfo.PartnerLevel || '-'}</Descriptions.Item>
              <Descriptions.Item label="区域">{partnerInfo.Region || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={partnerInfo.Status === 'ACTIVE' ? 'success' : 'default'}>
                  {partnerInfo.Status === 'ACTIVE' ? '活跃' : partnerInfo.Status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </>
      )}
      
      <Divider />

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>订单列表</Title>
        </Col>
        <Col>
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/partner-management/orders/new')}
          >
            创建新订单
          </Button>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Select
              placeholder="订单状态"
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
          <Col span={8}>
            <Input 
              placeholder="搜索订单编号" 
              prefix={<SearchOutlined />} 
              onChange={(e) => handleFilterChange('query', e.target.value)}
              value={filters.query}
            />
          </Col>
          <Col span={8}>
            <Space>
              <Button 
                icon={<FilterOutlined />} 
                onClick={handleResetFilters}
              >
                重置筛选
              </Button>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={() => fetchPartnerOrders(pagination.current, pagination.pageSize)}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="OrderId"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
      
      {/* 状态更新对话框 */}
      <Modal
        title="更新订单状态"
        open={statusModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => setStatusModalVisible(false)}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item
            name="status"
            label="订单状态"
            rules={[{ required: true, message: '请选择订单状态' }]}
          >
            <Select>
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="comments"
            label="备注"
          >
            <TextArea rows={4} placeholder="添加备注说明（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartnerOrdersList;
