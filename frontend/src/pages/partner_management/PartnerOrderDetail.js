import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Divider,
  Typography,
  Row,
  Col,
  Table,
  Space,
  Modal,
  Select,
  Form,
  Input,
  message,
  Spin,
  Alert
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { API_BASE_URL } from '../../services/config';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const PartnerOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/admin/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        message.error('无法加载订单详情');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Handle status update
  const handleStatusUpdate = async (values) => {
    setSubmitting(true);
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, {
        status: values.status,
        comments: values.comments
      });
      
      setOrder(response.data);
      message.success('订单状态已更新');
      setStatusModalVisible(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('无法更新订单状态');
    } finally {
      setSubmitting(false);
    }
  };

  // Show confirmation before rejecting
  const showRejectConfirm = () => {
    confirm({
      title: '确认拒绝此订单？',
      icon: <ExclamationCircleOutlined />,
      content: '拒绝后，合作伙伴将需要重新提交订单。请确认此操作。',
      okText: '确认拒绝',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        form.setFieldsValue({ status: 'REJECTED' });
        setStatusModalVisible(true);
      }
    });
  };

  // Show confirmation before approving
  const showApproveConfirm = () => {
    confirm({
      title: '确认批准此订单？',
      icon: <CheckCircleOutlined />,
      content: '批准后，将通知合作伙伴并开始处理订单。请确认此操作。',
      okText: '确认批准',
      okType: 'primary',
      cancelText: '取消',
      onOk() {
        form.setFieldsValue({ status: 'APPROVED' });
        setStatusModalVisible(true);
      }
    });
  };

  // Column definitions for order items table
  const columns = [
    {
      title: '产品名称',
      dataIndex: 'ProductName',
      key: 'ProductName',
    },
    {
      title: '授权类型',
      dataIndex: 'LicenseType',
      key: 'LicenseType',
    },
    {
      title: '最终用户',
      dataIndex: 'EndUserName',
      key: 'EndUserName',
    },
    {
      title: '数量',
      dataIndex: 'Quantity',
      key: 'Quantity',
      align: 'center',
    },
    {
      title: '授权期限',
      dataIndex: 'LicenseDurationYears',
      key: 'LicenseDurationYears',
      align: 'center',
      render: (years) => `${years}年`,
    },
    {
      title: '单价',
      dataIndex: 'UnitPrice',
      key: 'UnitPrice',
      align: 'right',
      render: (price) => `¥${price.toLocaleString()}`,
    },
    {
      title: '税率',
      dataIndex: 'TaxRate',
      key: 'TaxRate',
      align: 'center',
      render: (rate) => `${(rate * 100).toFixed(1)}%`,
    },
    {
      title: '总价',
      dataIndex: 'TotalPrice',
      key: 'TotalPrice',
      align: 'right',
      render: (price) => `¥${price.toLocaleString()}`,
    },
  ];

  // Get status tag
  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: 'warning', text: '审核中' },
      APPROVED: { color: 'success', text: '已批准' },
      REJECTED: { color: 'error', text: '已拒绝' },
      COMPLETED: { color: 'blue', text: '已完成' }
    };
    
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error state if order not found
  if (!order) {
    return (
      <Alert
        message="订单不存在"
        description="无法找到请求的订单详情。请返回订单列表查看有效订单。"
        type="error"
        showIcon
        action={
          <Button 
            type="primary" 
            onClick={() => navigate('/partner-management/orders')}
          >
            返回列表
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/partner-management/orders')}
        >
          返回订单列表
        </Button>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3}>订单详情</Title>
          
          {order.Status === 'PENDING' && (
            <Space>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                onClick={showApproveConfirm}
              >
                批准订单
              </Button>
              <Button 
                danger 
                icon={<CloseCircleOutlined />} 
                onClick={showRejectConfirm}
              >
                拒绝订单
              </Button>
            </Space>
          )}
          
          {order.Status !== 'PENDING' && (
            <Button 
              icon={<EditOutlined />} 
              onClick={() => setStatusModalVisible(true)}
            >
              更新状态
            </Button>
          )}
        </div>

        <Descriptions bordered>
          <Descriptions.Item label="订单编号" span={2}>{order.OrderNumber}</Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(order.Status)}</Descriptions.Item>
          <Descriptions.Item label="合作伙伴名称" span={2}>{order.PartnerName}</Descriptions.Item>
          <Descriptions.Item label="订单日期">
            {new Date(order.OrderDate).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="协议确认" span={3}>
            {order.AgreementAcknowledged ? 
              <Tag color="green">已确认</Tag> : 
              <Tag color="red">未确认</Tag>
            }
            {order.AgreementDate && ` (确认时间: ${new Date(order.AgreementDate).toLocaleString('zh-CN')})`}
          </Descriptions.Item>
          {order.Notes && (
            <Descriptions.Item label="备注" span={3}>{order.Notes}</Descriptions.Item>
          )}
        </Descriptions>

        <Divider />
        
        <Title level={4}>订单项目</Title>
        <Table
          dataSource={order.OrderItems}
          columns={columns}
          rowKey={(record, index) => `item-${index}`}
          pagination={false}
        />

        <Divider />
        
        <Row justify="end">
          <Col>
            <Text strong style={{ fontSize: 16 }}>订单总额: </Text>
            <Text style={{ fontSize: 20, color: '#1890ff' }}>
              ¥{order.TotalAmount.toLocaleString()}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Status Update Modal */}
      <Modal
        title="更新订单状态"
        visible={statusModalVisible}
        confirmLoading={submitting}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
          initialValues={{ status: order?.Status }}
        >
          <Form.Item
            name="status"
            label="新状态"
            rules={[{ required: true, message: '请选择订单状态' }]}
          >
            <Select>
              <Option value="PENDING">审核中</Option>
              <Option value="APPROVED">已批准</Option>
              <Option value="REJECTED">已拒绝</Option>
              <Option value="COMPLETED">已完成</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="comments"
            label="备注"
          >
            <TextArea rows={4} placeholder="在这里添加状态变更的相关备注..." />
          </Form.Item>
          
          <Form.Item>
            <div style={{ textAlign: 'right' }}>
              <Button 
                style={{ marginRight: 8 }} 
                onClick={() => setStatusModalVisible(false)}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
              >
                更新状态
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartnerOrderDetail;
