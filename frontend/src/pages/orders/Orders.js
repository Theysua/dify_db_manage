import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import {
  Card,
  Table,
  Button,
  Tag,
  Input,
  Form,
  Space,
  message,
  Drawer,
  Descriptions,
  Modal,
  Select,
  DatePicker,
  Spin,
  Typography,
  InputNumber,
  Row,
  Col,
  Tooltip,
  Divider
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { fetchWithAuth, API_BASE_URL } from '../../utils/api';
import OrderReviewForm from './OrderReviewForm';
// PageHeader组件不存在，使用Typography.Title代替

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Orders = () => {
  // 获取用户信息和权限
  const { isAdmin } = useAuth();
  
  // 状态管理
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 过滤条件
  const [filters, setFilters] = useState({
    po_number: '',
    customer_name: '',
    order_status: '',
    order_source: ''
  });
  
  // 抽屉控制
  const [orderDrawerVisible, setOrderDrawerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // 订单创建表单
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [customerOptions, setCustomerOptions] = useState([]); // 初始化为空数组而不是undefined
  
  // 审核表单
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [orderToReview, setOrderToReview] = useState(null);
  
  // 初始加载
  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, [currentPage, pageSize]);
  
  // 获取订单列表
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // 构建查询参数
      const queryParams = new URLSearchParams({
        skip: (currentPage - 1) * pageSize,
        limit: pageSize
      });
      
      // 添加过滤条件
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      
      const response = await fetchWithAuth(
        `${API_BASE_URL}/orders/?${queryParams.toString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.items);
        setTotal(data.total);
      } else {
        throw new Error('获取订单列表失败');
      }
    } catch (error) {
      message.error(`获取订单列表错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 获取客户列表（用于订单创建）
  const fetchCustomers = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/customers/`);
      if (response.ok) {
        const data = await response.json();
        setCustomerOptions(data.items || []); // 确保即使API返回为空也设置为空数组
      }
    } catch (error) {
      message.error(`获取客户列表错误: ${error.message}`);
      setCustomerOptions([]); // 出错时设置为空数组
    }
  };
  
  // 查看订单详情
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDrawerVisible(true);
  };
  
  // 审核订单
  const reviewOrder = (order) => {
    setOrderToReview(order);
    setReviewModalVisible(true);
  };
  
  // 提交订单审核
  const handleOrderReview = async (values) => {
    try {
      setLoading(true);
      
      const response = await fetchWithAuth(
        `${API_BASE_URL}/orders/${orderToReview.order_id}/update-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        message.success(`订单 ${data.po_number} 已${values.order_status === 'APPROVED' ? '批准' : '拒绝'}`);
        setReviewModalVisible(false);
        fetchOrders(); // 刷新列表
      } else {
        throw new Error('订单审核失败');
      }
    } catch (error) {
      message.error(`订单审核错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 创建新订单
  const handleCreateOrder = async (values) => {
    try {
      setLoading(true);
      
      // 格式化日期
      const formattedValues = {
        ...values,
        order_date: values.order_date.format('YYYY-MM-DD')
      };
      
      const response = await fetchWithAuth(
        `${API_BASE_URL}/orders/manual-create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedValues),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        message.success(`订单 ${data.po_number} 创建成功`);
        setCreateDrawerVisible(false);
        createForm.resetFields();
        fetchOrders(); // 刷新列表
      } else {
        throw new Error('创建订单失败');
      }
    } catch (error) {
      message.error(`创建订单错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 应用过滤条件
  const applyFilters = () => {
    setCurrentPage(1); // 重置页码
    fetchOrders();
  };
  
  // 重置过滤条件
  const resetFilters = () => {
    setFilters({
      po_number: '',
      customer_name: '',
      order_status: '',
      order_source: ''
    });
    
    setCurrentPage(1);
    fetchOrders();
  };
  
  // 渲染订单状态标签
  const renderStatusTag = (status) => {
    const statusConfig = {
      PENDING: { color: 'gold', text: '待审核' },
      APPROVED: { color: 'green', text: '已批准' },
      REJECTED: { color: 'red', text: '已拒绝' },
      COMPLETED: { color: 'blue', text: '已完成' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };
  
  // 渲染订单来源标签
  const renderSourceTag = (source) => {
    const sourceConfig = {
      API: { color: 'purple', text: 'API接口' },
      MANUAL: { color: 'cyan', text: '手动创建' },
      PARTNER: { color: 'geekblue', text: '合作伙伴' }
    };
    
    const config = sourceConfig[source] || { color: 'default', text: source };
    return <Tag color={config.color}>{config.text}</Tag>;
  };
  
  // 表格列定义
  const columns = [
    {
      title: '订单号',
      dataIndex: 'po_number',
      key: 'po_number',
      render: (text) => <a onClick={() => viewOrderDetails(orders.find(o => o.po_number === text))}>{text}</a>
    },
    {
      title: '客户名称',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: '产品',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: '许可类型',
      dataIndex: 'license_type',
      key: 'license_type',
    },
    {
      title: '订单状态',
      dataIndex: 'order_status',
      key: 'order_status',
      render: (status) => renderStatusTag(status)
    },
    {
      title: '订单来源',
      dataIndex: 'order_source',
      key: 'order_source',
      render: (source) => renderSourceTag(source)
    },
    {
      title: '订单日期',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date) => moment(date).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<FileTextOutlined />} 
            onClick={() => viewOrderDetails(record)}
          >
            详情
          </Button>
          {record.order_status === 'PENDING' && isAdmin() && (
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => reviewOrder(record)}
            >
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ];
  
  return (
    <div className="orders-page">
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>订单管理</Title>
        <Text>查看并管理PO单，审核订单并生成许可证</Text>
      </div>
      
      {/* 过滤条件 */}
      <Card style={{ marginBottom: 16 }}>
        <Form layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item label="订单号">
            <Input 
              placeholder="输入订单号" 
              value={filters.po_number}
              onChange={(e) => setFilters({...filters, po_number: e.target.value})}
              allowClear
            />
          </Form.Item>
          
          <Form.Item label="客户名称">
            <Input 
              placeholder="输入客户名称" 
              value={filters.customer_name}
              onChange={(e) => setFilters({...filters, customer_name: e.target.value})}
              allowClear
            />
          </Form.Item>
          
          <Form.Item label="订单状态">
            <Select 
              placeholder="选择状态" 
              style={{ width: 120 }}
              value={filters.order_status}
              onChange={(value) => setFilters({...filters, order_status: value})}
              allowClear
            >
              <Option value="PENDING">待审核</Option>
              <Option value="APPROVED">已批准</Option>
              <Option value="REJECTED">已拒绝</Option>
              <Option value="COMPLETED">已完成</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="订单来源">
            <Select 
              placeholder="选择来源" 
              style={{ width: 120 }}
              value={filters.order_source}
              onChange={(value) => setFilters({...filters, order_source: value})}
              allowClear
            >
              <Option value="API">API接口</Option>
              <Option value="MANUAL">手动创建</Option>
              <Option value="PARTNER">合作伙伴</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" onClick={applyFilters} icon={<SearchOutlined />}>
              搜索
            </Button>
          </Form.Item>
          
          <Form.Item>
            <Button onClick={resetFilters}>重置</Button>
          </Form.Item>
        </Form>
      </Card>
      
      {/* 订单列表 */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>订单列表</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateDrawerVisible(true)}
            >
              创建订单
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="order_id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }
          }}
        />
      </Card>
      
      {/* 订单详情抽屉 */}
      <Drawer
        title={`订单详情: ${selectedOrder?.po_number || ''}`}
        width={600}
        open={orderDrawerVisible}
        onClose={() => setOrderDrawerVisible(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            {selectedOrder?.order_status === 'PENDING' && isAdmin() && (
              <Button 
                type="primary" 
                onClick={() => {
                  setOrderDrawerVisible(false);
                  reviewOrder(selectedOrder);
                }}
              >
                审核订单
              </Button>
            )}
            <Button style={{ marginLeft: 8 }} onClick={() => setOrderDrawerVisible(false)}>
              关闭
            </Button>
          </div>
        }
      >
        {selectedOrder && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="订单号">{selectedOrder.po_number}</Descriptions.Item>
            <Descriptions.Item label="客户名称">{selectedOrder.customer_name}</Descriptions.Item>
            <Descriptions.Item label="联系人">{selectedOrder.contact_person}</Descriptions.Item>
            <Descriptions.Item label="联系邮箱">{selectedOrder.contact_email}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{selectedOrder.contact_phone}</Descriptions.Item>
            <Descriptions.Item label="产品名称">{selectedOrder.product_name}</Descriptions.Item>
            <Descriptions.Item label="产品版本">{selectedOrder.product_version}</Descriptions.Item>
            <Descriptions.Item label="许可类型">{selectedOrder.license_type}</Descriptions.Item>
            <Descriptions.Item label="数量">{selectedOrder.quantity}</Descriptions.Item>
            <Descriptions.Item label="金额">{`${selectedOrder.amount} ${selectedOrder.currency}`}</Descriptions.Item>
            <Descriptions.Item label="授权工作区数量">{selectedOrder.authorized_workspaces}</Descriptions.Item>
            <Descriptions.Item label="授权用户数量">{selectedOrder.authorized_users}</Descriptions.Item>
            <Descriptions.Item label="订单日期">{moment(selectedOrder.order_date).format('YYYY-MM-DD')}</Descriptions.Item>
            <Descriptions.Item label="订单状态">{renderStatusTag(selectedOrder.order_status)}</Descriptions.Item>
            <Descriptions.Item label="订单来源">{renderSourceTag(selectedOrder.order_source)}</Descriptions.Item>
            <Descriptions.Item label="激活模式">
              <Tag color={selectedOrder.activation_mode === 'ONLINE' ? 'green' : 'blue'}>
                {selectedOrder.activation_mode === 'ONLINE' ? '在线激活' : '离线激活'}
              </Tag>
            </Descriptions.Item>
            
            {selectedOrder.activation_mode === 'OFFLINE' && (
              <Descriptions.Item label="集群ID">{selectedOrder.cluster_id}</Descriptions.Item>
            )}
            
            {selectedOrder.review_notes && (
              <Descriptions.Item label="审核备注">{selectedOrder.review_notes}</Descriptions.Item>
            )}
            
            {selectedOrder.reviewed_by && (
              <Descriptions.Item label="审核人">{selectedOrder.reviewed_by}</Descriptions.Item>
            )}
            
            {selectedOrder.reviewed_at && (
              <Descriptions.Item label="审核时间">{moment(selectedOrder.reviewed_at).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            )}
            
            {selectedOrder.license_id && (
              <Descriptions.Item label="许可证ID">
                <a href={`#/licenses/${selectedOrder.license_id}`} target="_blank">
                  {selectedOrder.license_id}
                </a>
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="创建时间">{moment(selectedOrder.created_at).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{moment(selectedOrder.updated_at).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
      
      {/* 创建订单抽屉 */}
      <Drawer
        title="创建新订单"
        width={600}
        open={createDrawerVisible}
        onClose={() => setCreateDrawerVisible(false)}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setCreateDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={() => createForm.submit()} loading={loading}>
              提交
            </Button>
          </div>
        }
        extra={
          <Tooltip title="查看API文档">
            <Button 
              type="text" 
              icon={<InfoCircleOutlined />} 
              onClick={() => Modal.info({
                title: '订单创建API文档',
                width: 700,
                content: (
                  <div>
                    <Typography.Title level={4}>手动创建订单 API</Typography.Title>
                    <Typography.Paragraph>
                      <strong>端点：</strong> POST /api/v1/orders/manual-create
                    </Typography.Paragraph>
                    
                    <Typography.Paragraph>
                      <strong>描述：</strong> 手动创建新的采购订单 (PO)，供内部系统使用
                    </Typography.Paragraph>
                    
                    <Typography.Title level={5}>请求参数</Typography.Title>
                    <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>
{`{
  "po_number": "PO12345",              // 必填，采购订单号
  "customer_id": 1,                   // 必填，客户ID
  "customer_name": "示例公司",         // 必填，客户名称
  "contact_person": "张三",           // 可选，联系人
  "contact_email": "zhangsan@ex.com", // 可选，联系邮箱
  "contact_phone": "13812345678",     // 可选，联系电话
  
  "product_name": "Dify企业版",        // 必填，产品名称
  "product_version": "1.0",           // 可选，产品版本
  "license_type": "ENTERPRISE",       // 必填，许可类型
  "quantity": 1,                      // 可选，数量，默认为1
  "amount": 10000,                    // 必填，金额
  "currency": "CNY",                  // 可选，货币，默认为USD
  
  "authorized_workspaces": 5,         // 可选，授权工作区数量
  "authorized_users": 20,             // 可选，授权用户数量
  
  "order_date": "2025-04-03",         // 必填，订单日期
  "activation_mode": "ONLINE",        // 可选，激活模式，默认为ONLINE
  "cluster_id": "cluster123"          // 可选，集群ID（离线模式需要）
}`}
                    </pre>
                    
                    <Typography.Title level={5}>返回示例</Typography.Title>
                    <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>
{`{
  "order_id": 1,
  "po_number": "PO12345",
  "customer_id": 1,
  "customer_name": "示例公司",
  "product_name": "Dify企业版", 
  "license_type": "ENTERPRISE",
  "order_status": "PENDING",
  "order_source": "MANUAL",
  "created_at": "2025-04-03T10:15:30",
  "updated_at": "2025-04-03T10:15:30"
  ... // 其他字段
}`}
                    </pre>
                    
                    <Divider />
                    
                    <Typography.Title level={4}>外部系统创建订单 API</Typography.Title>
                    <Typography.Paragraph>
                      <strong>端点：</strong> POST /api/v1/orders/create
                    </Typography.Paragraph>
                    
                    <Typography.Paragraph>
                      <strong>描述：</strong> 创建新的采购订单 (PO)，供外部系统调用
                    </Typography.Paragraph>
                    
                    <Typography.Paragraph>
                      参数格式与手动创建订单相同，但无需指定order_source（默认为API）
                    </Typography.Paragraph>
                  </div>
                ),
                maskClosable: true
              })}
            />
          </Tooltip>
        }
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateOrder}
          initialValues={{
            activation_mode: 'ONLINE',
            currency: 'USD',
            quantity: 1,
            order_date: moment()
          }}
        >
          <Title level={5}>基本信息</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="po_number"
                label="订单号"
                rules={[{ required: true, message: '请输入订单号' }]}
              >
                <Input placeholder="请输入订单号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customer_id"
                label="客户"
                rules={[{ required: true, message: '请选择客户' }]}
              >
                <Select placeholder="请选择客户">
                  {Array.isArray(customerOptions) && customerOptions.length > 0 ? (
                    customerOptions.map(customer => (
                      <Option key={customer.customer_id} value={customer.customer_id}>
                        {customer.customer_name}
                      </Option>
                    ))
                  ) : (
                    <Option value="" disabled>暂无客户数据</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact_person"
                label="联系人"
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contact_email"
                label="联系邮箱"
                rules={[
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入联系邮箱" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact_phone"
                label="联系电话"
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="order_date"
                label="订单日期"
                rules={[{ required: true, message: '请选择订单日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Title level={5} style={{ marginTop: 16 }}>产品信息</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="product_name"
                label="产品名称"
                rules={[{ required: true, message: '请输入产品名称' }]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="product_version"
                label="产品版本"
              >
                <Input placeholder="请输入产品版本" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="license_type"
                label="许可类型"
                rules={[{ required: true, message: '请输入许可类型' }]}
              >
                <Select placeholder="请选择许可类型">
                  <Option value="ENTERPRISE">企业版</Option>
                  <Option value="PROFESSIONAL">专业版</Option>
                  <Option value="TEAM">团队版</Option>
                  <Option value="TRIAL">试用版</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="数量"
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="金额"
                rules={[{ required: true, message: '请输入金额' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={100} 
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currency"
                label="货币"
                rules={[{ required: true, message: '请选择货币' }]}
              >
                <Select placeholder="请选择货币">
                  <Option value="USD">美元 (USD)</Option>
                  <Option value="CNY">人民币 (CNY)</Option>
                  <Option value="EUR">欧元 (EUR)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Title level={5} style={{ marginTop: 16 }}>许可规格</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="authorized_workspaces"
                label="授权工作区数量"
                rules={[{ required: true, message: '请输入授权工作区数量' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="authorized_users"
                label="授权用户数量"
                rules={[{ required: true, message: '请输入授权用户数量' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          
          <Title level={5} style={{ marginTop: 16 }}>激活设置</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="activation_mode"
                label="激活模式"
                rules={[{ required: true, message: '请选择激活模式' }]}
              >
                <Select placeholder="请选择激活模式">
                  <Option value="ONLINE">在线激活</Option>
                  <Option value="OFFLINE">离线激活</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cluster_id"
                label="集群ID"
                dependencies={['activation_mode']}
                rules={[
                  ({ getFieldValue }) => ({
                    required: getFieldValue('activation_mode') === 'OFFLINE',
                    message: '离线激活模式必须提供集群ID',
                  }),
                ]}
              >
                <Input placeholder="请输入集群ID" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
      
      {/* 订单审核模态框 */}
      {orderToReview && (
        <OrderReviewForm
          visible={reviewModalVisible}
          order={orderToReview}
          onSubmit={handleOrderReview}
          onCancel={() => setReviewModalVisible(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Orders;
