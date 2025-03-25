import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber, Row, Col, message } from 'antd';
import { createLead, updateLead } from '../../services/leadService';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const LeadForm = ({ lead, statuses, sources, salesReps, partners, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  
  // 如果是编辑模式，初始化表单数据
  useEffect(() => {
    if (lead) {
      const formValues = {
        ...lead,
        expected_close_date: lead.expected_close_date ? moment(lead.expected_close_date) : null,
        next_activity_date: lead.next_activity_date ? moment(lead.next_activity_date) : null,
      };
      form.setFieldsValue(formValues);
    } else {
      // 如果是新增且当前用户是合作伙伴，自动设置partner_id
      if (user?.role === 'partner' && user?.partner_id) {
        form.setFieldsValue({ partner_id: user?.partner_id });
      }
      
      // 默认设置为第一个状态（通常是"新线索"）
      if (statuses && statuses.length > 0) {
        form.setFieldsValue({ status_id: statuses[0].status_id });
      }
    }
  }, [lead, form, user, statuses]);
  
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // 转换日期格式
      if (values.expected_close_date) {
        values.expected_close_date = values.expected_close_date.format('YYYY-MM-DD');
      }
      if (values.next_activity_date) {
        values.next_activity_date = values.next_activity_date.toISOString();
      }
      
      if (lead) {
        // 更新现有商机
        await updateLead(lead.lead_id, values);
        message.success('商机更新成功');
      } else {
        // 创建新商机
        await createLead(values);
        message.success('商机创建成功');
      }
      onSuccess();
      form.resetFields();
    } catch (error) {
      console.error('Failed to save lead:', error);
      message.error('保存商机失败');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        currency: 'CNY',
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="lead_name"
            label="商机名称"
            rules={[{ required: true, message: '请输入商机名称' }]}
          >
            <Input placeholder="请输入商机名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="company_name"
            label="公司名称"
            rules={[{ required: true, message: '请输入公司名称' }]}
          >
            <Input placeholder="请输入公司名称" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="contact_person"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input placeholder="请输入联系人" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="contact_email"
            label="联系邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入联系邮箱" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="contact_phone"
            label="联系电话"
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="status_id"
            label="商机状态"
            rules={[{ required: true, message: '请选择商机状态' }]}
          >
            <Select placeholder="请选择商机状态">
              {statuses.map(status => (
                <Option key={status.status_id} value={status.status_id}>
                  {status.status_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="source_id"
            label="商机来源"
          >
            <Select placeholder="请选择商机来源" allowClear>
              {sources.map(source => (
                <Option key={source.source_id} value={source.source_id}>
                  {source.source_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="industry"
            label="行业"
          >
            <Input placeholder="请输入行业" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="sales_rep_id"
            label="销售代表"
          >
            <Select placeholder="请选择销售代表" allowClear>
              {salesReps.map(rep => (
                <Option key={rep.sales_rep_id} value={rep.sales_rep_id}>
                  {rep.sales_rep_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="partner_id"
            label="合作伙伴"
            disabled={user?.role === 'partner'} // 合作伙伴角色不能更改此字段
          >
            <Select placeholder="请选择合作伙伴" allowClear disabled={user?.role === 'partner'}>
              {partners.map(partner => (
                <Option key={partner.partner_id} value={partner.partner_id}>
                  {partner.partner_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="region"
            label="区域"
          >
            <Input placeholder="请输入区域" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="product_interest"
            label="感兴趣产品"
          >
            <Input placeholder="请输入感兴趣的产品" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="expected_close_date"
            label="预计成单日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            name="probability"
            label="成单概率(%)"
            rules={[{ type: 'number', min: 0, max: 100, message: '概率必须在0-100之间' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            name="estimated_value"
            label="预估价值"
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="currency"
            label="货币"
          >
            <Select>
              <Option value="CNY">人民币 (CNY)</Option>
              <Option value="USD">美元 (USD)</Option>
              <Option value="EUR">欧元 (EUR)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item
            name="next_activity_date"
            label="下次活动日期"
          >
            <DatePicker 
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="next_activity_description"
        label="下次活动描述"
      >
        <Input placeholder="请描述下次计划的活动" />
      </Form.Item>
      
      <Form.Item
        name="notes"
        label="备注"
      >
        <TextArea rows={4} placeholder="请输入备注信息" />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting} style={{ marginRight: 8 }}>
          {lead ? '更新' : '创建'}
        </Button>
        <Button onClick={onCancel}>取消</Button>
      </Form.Item>
    </Form>
  );
};

export default LeadForm;
