import React from 'react';
import {
  Modal,
  Form,
  Input,
  Radio,
  Button,
  Space,
  Descriptions,
  Typography,
  Tag,
  Alert
} from 'antd';
import moment from 'moment';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const OrderReviewForm = ({ visible, order, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();
  
  // 提交表单
  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values);
    });
  };
  
  // 批准订单
  const approveOrder = () => {
    form.setFieldsValue({ order_status: 'APPROVED' });
    handleSubmit();
  };
  
  // 拒绝订单
  const rejectOrder = () => {
    form.setFieldsValue({ order_status: 'REJECTED' });
    handleSubmit();
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
  
  return (
    <Modal
      title="订单审核"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" initialValues={{ order_status: 'PENDING' }}>
        {/* 隐藏状态字段 */}
        <Form.Item name="order_status" style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        
        {/* 订单基本信息 */}
        <Descriptions
          title="订单信息"
          bordered
          column={2}
          size="small"
          style={{ marginBottom: 20 }}
        >
          <Descriptions.Item label="订单号" span={2}>{order?.po_number}</Descriptions.Item>
          <Descriptions.Item label="客户名称" span={2}>{order?.customer_name}</Descriptions.Item>
          <Descriptions.Item label="产品名称">{order?.product_name}</Descriptions.Item>
          <Descriptions.Item label="产品版本">{order?.product_version}</Descriptions.Item>
          <Descriptions.Item label="许可类型">{order?.license_type}</Descriptions.Item>
          <Descriptions.Item label="订单状态">{renderStatusTag(order?.order_status)}</Descriptions.Item>
          <Descriptions.Item label="金额">{`${order?.amount} ${order?.currency}`}</Descriptions.Item>
          <Descriptions.Item label="订单日期">{moment(order?.order_date).format('YYYY-MM-DD')}</Descriptions.Item>
          <Descriptions.Item label="授权工作区">{order?.authorized_workspaces}</Descriptions.Item>
          <Descriptions.Item label="授权用户">{order?.authorized_users}</Descriptions.Item>
          <Descriptions.Item label="激活模式">
            {order?.activation_mode === 'ONLINE' ? '在线激活' : '离线激活'}
          </Descriptions.Item>
          {order?.activation_mode === 'OFFLINE' && (
            <Descriptions.Item label="集群ID">{order?.cluster_id}</Descriptions.Item>
          )}
        </Descriptions>
        
        <Alert
          message="审核流程说明"
          description={
            <div>
              <p>
                <strong>批准订单：</strong> 系统将自动创建许可证，并设置与订单相同的激活模式和参数。订单状态将更新为"已完成"。
              </p>
              <p>
                <strong>拒绝订单：</strong> 订单状态将更新为"已拒绝"，不会创建许可证。
              </p>
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 20 }}
        />
        
        {/* 审核意见 */}
        <Form.Item
          name="review_notes"
          label="审核备注"
          rules={[{ required: true, message: '请输入审核备注' }]}
        >
          <TextArea rows={4} placeholder="请输入审核意见或备注" />
        </Form.Item>
        
        {/* 操作按钮 */}
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button 
              type="danger" 
              icon={<CloseCircleOutlined />} 
              onClick={rejectOrder}
              loading={loading}
            >
              拒绝
            </Button>
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={approveOrder}
              loading={loading}
            >
              批准并生成许可证
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderReviewForm;
