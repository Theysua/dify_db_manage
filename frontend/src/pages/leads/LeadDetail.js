import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Descriptions, Tag, Timeline,
  Button, Tabs, message, Spin, Drawer, Empty, Modal, Tooltip,
  Space, Select, Form, Input, DatePicker
} from 'antd';
import { 
  PlusOutlined, EditOutlined, ClockCircleOutlined, 
  CheckCircleOutlined, InfoCircleOutlined, MessageOutlined,
  PhoneOutlined, MailOutlined, UserOutlined, 
  FileTextOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  getLead, updateLead, updateLeadStatusOnly, 
  createLeadActivity, getLeadActivities, deleteLeadActivity 
} from '../../services/leadService';
import { getLeadStatuses } from '../../services/leadService';
import LeadForm from './LeadForm';
import useAuth from '../../hooks/useAuth';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const LeadDetail = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activityDrawerVisible, setActivityDrawerVisible] = useState(false);
  const [activityForm] = Form.useForm();
  const [statuses, setStatuses] = useState([]);
  const [changingStatus, setChangingStatus] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // 获取商机详情与活动
  useEffect(() => {
    fetchLeadDetails();
    fetchLeadActivities();
    fetchLeadStatuses();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const response = await getLead(leadId);
      setLead(response.data);
    } catch (error) {
      console.error('Failed to fetch lead details:', error);
      message.error('获取商机详情失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadActivities = async () => {
    try {
      setActivityLoading(true);
      const response = await getLeadActivities(leadId);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch lead activities:', error);
      message.error('获取商机活动记录失败');
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchLeadStatuses = async () => {
    try {
      const response = await getLeadStatuses();
      setStatuses(response.data);
    } catch (error) {
      console.error('Failed to fetch lead statuses:', error);
    }
  };

  const handleEditLead = () => {
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    fetchLeadDetails();
  };

  const handleStatusChange = async (statusId) => {
    try {
      setChangingStatus(true);
      await updateLeadStatusOnly(leadId, { status_id: statusId });
      message.success('状态已更新');
      fetchLeadDetails();
    } catch (error) {
      console.error('Failed to update lead status:', error);
      message.error('更新状态失败');
    } finally {
      setChangingStatus(false);
    }
  };

  const handleAddActivity = () => {
    activityForm.resetFields();
    setActivityDrawerVisible(true);
  };

  const handleActivitySubmit = async () => {
    try {
      const values = await activityForm.validateFields();
      
      // 格式化日期
      if (values.activity_date) {
        values.activity_date = values.activity_date.toISOString();
      }
      
      await createLeadActivity(leadId, values);
      message.success('活动记录已添加');
      setActivityDrawerVisible(false);
      fetchLeadActivities();
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写必填字段');
      } else {
        console.error('Failed to add activity:', error);
        message.error('添加活动记录失败');
      }
    }
  };

  const handleDeleteActivity = (activityId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条活动记录吗？此操作不可逆。',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteLeadActivity(leadId, activityId);
          message.success('活动记录已删除');
          fetchLeadActivities();
        } catch (error) {
          console.error('Failed to delete activity:', error);
          message.error('删除活动记录失败');
        }
      },
    });
  };

  // 根据状态名称获取对应的颜色
  const getStatusColor = (statusName) => {
    const statusColors = {
      '新线索': 'blue',
      '洽谈中': 'orange',
      '已提交方案': 'cyan',
      '已赢单': 'green',
      '已输单': 'red',
      '已取消': 'gray',
    };
    return statusColors[statusName] || 'default';
  };

  // 根据活动类型获取图标
  const getActivityIcon = (activityType) => {
    const icons = {
      '电话': <PhoneOutlined />,
      '邮件': <MailOutlined />,
      '会议': <UserOutlined />,
      '提交方案': <FileTextOutlined />,
      '备注': <MessageOutlined />,
    };
    return icons[activityType] || <ClockCircleOutlined />;
  };

  // 如果认证信息或商机数据正在加载中，显示加载状态
  if (loading || authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p>{loading ? '正在加载商机数据...' : '正在验证用户权限...'}</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <Empty 
        description="未找到商机数据" 
        style={{ padding: '100px 0' }}
      />
    );
  }

  return (
    <div className="page-container">
      <Card bordered={false}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Space align="center">
              <Title level={4}>{lead.lead_name}</Title>
              <Tag color={getStatusColor(lead.status.status_name)}>{lead.status.status_name}</Tag>
            </Space>
            <Text type="secondary">{lead.company_name}</Text>
          </Col>
          <Col>
            <Space>
              <Select
                placeholder="更改状态"
                value={lead.status_id}
                onChange={handleStatusChange}
                style={{ width: 150 }}
                loading={changingStatus}
                disabled={!(user?.role === 'admin' || user?.role === 'sales_rep')}
              >
                {statuses.map(status => (
                  <Option key={status.status_id} value={status.status_id}>
                    {status.status_name}
                  </Option>
                ))}
              </Select>
              {(user?.role === 'admin' || user?.role === 'sales_rep') && (
                <Button icon={<EditOutlined />} onClick={handleEditLead}>
                  编辑商机
                </Button>
              )}
              <Button type="primary" onClick={() => navigate('/leads')}>
                返回列表
              </Button>
            </Space>
          </Col>
        </Row>

        <Tabs defaultActiveKey="details">
          <TabPane tab="基本信息" key="details">
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <Card title="商机详情" bordered={false}>
                  <Descriptions column={2}>
                    <Descriptions.Item label="联系人">{lead.contact_person || '-'}</Descriptions.Item>
                    <Descriptions.Item label="联系电话">{lead.contact_phone || '-'}</Descriptions.Item>
                    <Descriptions.Item label="联系邮箱">{lead.contact_email || '-'}</Descriptions.Item>
                    <Descriptions.Item label="行业">{lead.industry || '-'}</Descriptions.Item>
                    <Descriptions.Item label="销售代表">{lead.sales_rep?.sales_rep_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="区域">{lead.region || '-'}</Descriptions.Item>
                    <Descriptions.Item label="来源">{lead.source?.source_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="合作伙伴">{lead.partner?.partner_name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="预计成单日期">
                      {lead.expected_close_date ? moment(lead.expected_close_date).format('YYYY-MM-DD') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="成单概率">
                      {lead.probability !== null ? `${lead.probability}%` : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="预估价值" span={2}>
                      {lead.estimated_value ? `${lead.estimated_value.toLocaleString()} ${lead.currency}` : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="感兴趣产品" span={2}>
                      {lead.product_interest || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="备注" span={2}>
                      {lead.notes || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card 
                  title="下次活动"
                  bordered={false}
                  extra={
                    <Tooltip title="添加活动记录">
                      <Button 
                        type="text" 
                        icon={<PlusOutlined />} 
                        onClick={handleAddActivity}
                        disabled={!(user?.role === 'admin' || user?.role === 'sales_rep')}
                      />
                    </Tooltip>
                  }
                >
                  {lead.next_activity_date ? (
                    <>
                      <p>
                        <InfoCircleOutlined style={{ marginRight: 8 }} />
                        <Text strong>{lead.next_activity_description || '未指定活动'}</Text>
                      </p>
                      <p>
                        <ClockCircleOutlined style={{ marginRight: 8 }} />
                        <Text>{moment(lead.next_activity_date).format('YYYY-MM-DD HH:mm')}</Text>
                      </p>
                    </>
                  ) : (
                    <Empty description="暂无计划活动" />
                  )}
                </Card>
                
                <Card 
                  title="创建和更新信息" 
                  bordered={false}
                  style={{ marginTop: 16 }}
                >
                  <p>
                    <Text type="secondary">创建时间：</Text>
                    <Text>{moment(lead.created_at).format('YYYY-MM-DD HH:mm:ss')}</Text>
                  </p>
                  <p>
                    <Text type="secondary">最后更新：</Text>
                    <Text>{moment(lead.updated_at).format('YYYY-MM-DD HH:mm:ss')}</Text>
                  </p>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab="活动记录" key="activities">
            <Card 
              bordered={false}
              title="活动记录"
              extra={
                (user.role === 'admin' || user.role === 'sales_rep') && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddActivity}
                  >
                    添加活动
                  </Button>
                )
              }
            >
              {activityLoading ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Spin />
                </div>
              ) : activities.length > 0 ? (
                <Timeline>
                  {activities.map(activity => (
                    <Timeline.Item 
                      key={activity.activity_id} 
                      dot={getActivityIcon(activity.activity_type)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <Text strong>{activity.activity_type}</Text>
                          <div>
                            <Text>{activity.description}</Text>
                          </div>
                          <div>
                            <Text type="secondary">
                              {moment(activity.activity_date).format('YYYY-MM-DD HH:mm')}
                            </Text>
                          </div>
                        </div>
                        {(user.role === 'admin' || user.role === 'sales_rep') && (
                          <div>
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => handleDeleteActivity(activity.activity_id)}
                            />
                          </div>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty description="暂无活动记录" />
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      <Drawer
        title="编辑商机"
        width={720}
        onClose={() => setEditModalVisible(false)}
        visible={editModalVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <LeadForm
          lead={lead}
          statuses={statuses}
          sources={lead.source ? [lead.source] : []}
          salesReps={lead.sales_rep ? [lead.sales_rep] : []}
          partners={lead.partner ? [lead.partner] : []}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditModalVisible(false)}
        />
      </Drawer>

      <Drawer
        title="添加活动记录"
        width={400}
        onClose={() => setActivityDrawerVisible(false)}
        visible={activityDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setActivityDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={handleActivitySubmit}>
              保存
            </Button>
          </div>
        }
      >
        <Form form={activityForm} layout="vertical">
          <Form.Item
            name="activity_type"
            label="活动类型"
            rules={[{ required: true, message: '请选择活动类型' }]}
          >
            <Select placeholder="请选择活动类型">
              <Option value="电话">电话</Option>
              <Option value="邮件">邮件</Option>
              <Option value="会议">会议</Option>
              <Option value="提交方案">提交方案</Option>
              <Option value="备注">备注</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="activity_date"
            label="活动日期"
            rules={[{ required: true, message: '请选择活动日期' }]}
            initialValue={moment()}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss" 
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="活动描述"
            rules={[{ required: true, message: '请输入活动描述' }]}
          >
            <TextArea rows={4} placeholder="请输入活动描述" />
          </Form.Item>
          
          <Form.Item
            name="outcome"
            label="活动结果"
          >
            <TextArea rows={2} placeholder="请输入活动结果" />
          </Form.Item>
          
          <Form.Item
            name="next_activity_description"
            label="下一步计划"
          >
            <Input placeholder="请输入下一步计划" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default LeadDetail;
