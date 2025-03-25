import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  InputNumber,
  Typography,
  Divider,
  message,
  Space,
  Row,
  Col,
  Table,
  Checkbox,
  Modal
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../services/config';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateOrder = () => {
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // 加载合作伙伴数据
  useEffect(() => {
    const fetchPartners = async () => {
      try {
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

    // 可以添加获取客户数据的函数
    // const fetchCustomers = async () => {...}

    fetchPartners();
    // fetchCustomers();
  }, []);

  // 添加订单项
  const handleAddOrderItem = () => {
    const newItem = {
      key: Date.now(),
      ProductName: 'Dify Enterprise',
      Quantity: 1,
      UnitPrice: 0,
      TotalPrice: 0,
      EndUserName: ''
    };
    setOrderItems([...orderItems, newItem]);
  };

  // 移除订单项
  const handleRemoveOrderItem = (key) => {
    setOrderItems(orderItems.filter(item => item.key !== key));
  };

  // 更新订单项数据
  const handleOrderItemChange = (key, field, value) => {
    const updatedItems = orderItems.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        
        // 如果修改了数量或单价，自动计算总价
        if (field === 'Quantity' || field === 'UnitPrice') {
          const quantity = field === 'Quantity' ? value : item.Quantity;
          const unitPrice = field === 'UnitPrice' ? value : item.UnitPrice;
          updatedItem.TotalPrice = quantity * unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setOrderItems(updatedItems);
  };

  // 计算订单总金额
  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => total + (item.TotalPrice || 0), 0);
  };

  // 提交订单
  const handleSubmit = async (values) => {
    if (orderItems.length === 0) {
      message.error('请至少添加一个订单项');
      return;
    }

    setSubmitting(true);
    try {
      // 准备订单数据
      const orderData = {
        OrderNumber: values.OrderNumber,
        OrderDate: values.OrderDate ? values.OrderDate.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        TotalAmount: calculateOrderTotal(),
        Status: values.Status || 'DRAFT',
        Notes: values.Notes,
        // 如果需要关联到合作伙伴
        PartnerID: values.PartnerID ? parseInt(values.PartnerID) : null,
        // 添加订单项
        OrderItems: orderItems.map(item => ({
          ProductName: item.ProductName,
          Quantity: item.Quantity,
          UnitPrice: item.UnitPrice,
          TotalPrice: item.TotalPrice,
          EndUserName: item.EndUserName
        })),
        // 如果需要确认条款
        AgreementAcknowledged: true
      };

      const token = localStorage.getItem('dify_token');
      const response = await axios.post(`${API_BASE_URL}/admin/orders`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      message.success('订单创建成功');
      navigate('/partner-management/orders');
    } catch (error) {
      console.error('创建订单失败:', error);
      message.error('创建订单失败: ' + (error.response?.data?.detail || '服务器错误'));
    } finally {
      setSubmitting(false);
    }
  };

  // 订单项表格列定义
  const orderItemColumns = [
    {
      title: '产品名称',
      dataIndex: 'ProductName',
      key: 'ProductName',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleOrderItemChange(record.key, 'ProductName', e.target.value)}
        />
      ),
    },
    {
      title: '数量',
      dataIndex: 'Quantity',
      key: 'Quantity',
      width: 100,
      render: (text, record) => (
        <InputNumber
          min={1}
          value={text}
          onChange={(value) => handleOrderItemChange(record.key, 'Quantity', value)}
        />
      ),
    },
    {
      title: '单价 (¥)',
      dataIndex: 'UnitPrice',
      key: 'UnitPrice',
      width: 120,
      render: (text, record) => (
        <InputNumber
          min={0}
          step={0.01}
          precision={2}
          value={text}
          onChange={(value) => handleOrderItemChange(record.key, 'UnitPrice', value)}
        />
      ),
    },
    {
      title: '总价 (¥)',
      dataIndex: 'TotalPrice',
      key: 'TotalPrice',
      width: 120,
      render: (text) => <span>{text.toFixed(2)}</span>,
    },
    {
      title: '最终用户',
      dataIndex: 'EndUserName',
      key: 'EndUserName',
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleOrderItemChange(record.key, 'EndUserName', e.target.value)}
          placeholder="最终用户/客户名称"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveOrderItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>创建新订单</Title>
      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          OrderDate: moment(),
          Status: 'DRAFT'
        }}
      >
        <Card title="基本信息" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="OrderNumber"
                label="订单编号"
                rules={[{ required: true, message: '请输入订单编号' }]}
              >
                <Input placeholder="系统将生成" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="OrderDate"
                label="订单日期"
                rules={[{ required: true, message: '请选择订单日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="Status"
                label="状态"
              >
                <Select>
                  <Option value="DRAFT">草稿</Option>
                  <Option value="CONFIRMED">已确认</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="PartnerID"
                label="关联合作伙伴"
              >
                <Select placeholder="选择关联的合作伙伴" allowClear>
                  {partners.map(partner => (
                    <Option key={partner.PartnerID} value={partner.PartnerID}>
                      {partner.PartnerName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="Notes"
                label="备注"
              >
                <TextArea rows={4} placeholder="订单备注信息" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card 
          title="订单项目" 
          style={{ marginBottom: 24 }}
          extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddOrderItem}
            >
              添加产品
            </Button>
          }
        >
          <Table
            columns={orderItemColumns}
            dataSource={orderItems}
            rowKey="key"
            pagination={false}
            size="small"
            locale={{ emptyText: '请添加订单项目' }}
          />

          <Divider />
          
          <div style={{ textAlign: 'right' }}>
            <Title level={4}>
              订单总金额: ¥{calculateOrderTotal().toFixed(2)}
            </Title>
          </div>
        </Card>

        <Card>
          <Form.Item
            name="AgreementAcknowledged"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('必须同意条款才能创建订单')),
              },
            ]}
          >
            <Checkbox>我已确认订单信息准确无误，并同意订单条款</Checkbox>
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button 
                onClick={() => navigate('/partner-management/orders')}
                icon={<RollbackOutlined />}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<SaveOutlined />}
              >
                保存订单
              </Button>
            </Space>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default CreateOrder;
