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
  Col
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined
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
    partnerId: ''
  });
  const [partners, setPartners] = useState([]);

  // Fetch partners for filter dropdown
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/partners`);
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

      const response = await axios.get(`${API_BASE_URL}/admin/orders`, { params });
      
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
      partnerId: ''
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
              component={Link}
              to={`/partner-management/orders/${record.OrderId}`}
            >
              详情
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>合作伙伴订单管理</Title>
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
          <Col span={6}>
            <Select
              placeholder="合作伙伴"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => handleFilterChange('partnerId', value)}
              value={filters.partnerId}
            >
              {partners.map(partner => (
                <Option key={partner.PartnerId} value={partner.PartnerId}>
                  {partner.PartnerName}
                </Option>
              ))}
            </Select>
          </Col>
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
    </div>
  );
};

export default PartnerOrders;
