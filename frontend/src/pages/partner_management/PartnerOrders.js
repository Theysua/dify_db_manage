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
  Tooltip,
  Row,
  Col,
  Modal,
  Form,
  Popconfirm
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  LinkOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../services/config';

const { Title } = Typography;
const { Option } = Select;

const PartnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    query: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusForm] = Form.useForm();
  const [partners, setPartners] = useState([]);

  // Fetch partners for filter dropdown
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        // 获取认证token
        const token = localStorage.getItem('dify_token');
        
        const response = await axios.get(`${API_BASE_URL}/admin/partners`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPartners(response.data);
      } catch (error) {
        console.error('Error fetching partners:', error);
        message.error('无法加载合作伙伴数据');
      }
    };

    fetchPartners();
  }, []);

  // Fetch orders with pagination and filters
  const fetchOrders = async (page = 1, pageSize = 10) => {
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

      // 获取认证token
      const token = localStorage.getItem('dify_token');
      
      const response = await axios.get(`${API_BASE_URL}/admin/orders`, { 
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
      console.error('Error fetching orders:', error);
      message.error('加载订单数据失败');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchOrders(pagination.current, pagination.pageSize);
  }, [filters]);

  // Handle table change (pagination, filters)
  const handleTableChange = (pagination) => {
    fetchOrders(pagination.current, pagination.pageSize);
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
      fetchOrders(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('更新订单状态失败:', error);
      message.error('更新订单状态失败');
    }
  };
  
  // 删除订单（实际上通常是将状态改为CANCELED而非真正删除）
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
      status: ''
      // partnerId已从Order模型中移除，因此不再需要重置
    });
  };

  // Get tag color based on status
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
      default:
        return 'default';
    }
  };

  // Status options for filter
  const statusOptions = [
    { value: 'DRAFT', label: '草稿' },
    { value: 'CONFIRMED', label: '已确认' },
    { value: 'CANCELED', label: '已取消' },
    { value: 'PENDING', label: '审核中' },
    { value: 'APPROVED', label: '已批准' },
    { value: 'REJECTED', label: '已拒绝' },
    { value: 'COMPLETED', label: '已完成' }
  ];

  // Table columns definition
  const columns = [
    {
      title: '订单编号',
      dataIndex: 'OrderNumber',
      key: 'OrderNumber',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '合作伙伴',
      dataIndex: 'PartnerName',
      key: 'PartnerName',
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
              onClick={() => window.location.href = `/partner-management/orders/${record.OrderId}`}
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2}>合作伙伴订单管理</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            onClick={() => window.location.href = '/partner-management/orders/new'}
          >
            创建新订单
          </Button>
        </Col>
      </Row>
      <Divider />

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
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
          {/* 由于Order模型不再直接关联到合作伙伴，移除此过滤器 */}
          <Col span={6}>
            <Input 
              placeholder="搜索订单编号" 
              prefix={<SearchOutlined />} 
              onChange={(e) => handleFilterChange('query', e.target.value)}
              value={filters.query}
            />
          </Col>
          <Col span={6}>
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
                onClick={() => fetchOrders(pagination.current, pagination.pageSize)}
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
            <Input.TextArea rows={4} placeholder="添加备注说明（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartnerOrders;
