import React, { useState, useEffect } from 'react';
import {
  Card, Tabs, Button, Typography, Result, Form, Input, message, Space, Table, Modal,
  Alert, Descriptions, Divider, Tag
} from 'antd';
import {
  PlusOutlined, EditOutlined, SettingOutlined, BugOutlined, ReloadOutlined
} from '@ant-design/icons';
import useAuth from '../../hooks/useAuth';

const { Title } = Typography;
const { TabPane } = Tabs;

// 模拟获取商机来源数据
const mockSources = [
  { id: 1, name: '官网咨询', description: '客户通过官网咨询表单提交的商机' },
  { id: 2, name: '电话询盘', description: '客户通过电话咨询产生的商机' },
  { id: 3, name: '合作伙伴介绍', description: '合作伙伴推荐的客户资源' },
];

// 模拟获取商机状态数据
const mockStatuses = [
  { id: 1, name: '初步接触', description: '初步与客户建立联系', color: '#1890ff', order: 10 },
  { id: 2, name: '需求确认', description: '确认客户的具体需求', color: '#52c41a', order: 20 },
  { id: 3, name: '方案制定', description: '为客户制定解决方案', color: '#faad14', order: 30 },
  { id: 4, name: '商务谈判', description: '与客户就商务条款进行谈判', color: '#fa8c16', order: 40 },
  { id: 5, name: '签约完成', description: '成功与客户签约', color: '#13c2c2', order: 50 },
];

const LeadSettings = () => {
  const { isAdmin } = useAuth();
  const [sources, setSources] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [sourceForm] = Form.useForm();
  const [statusForm] = Form.useForm();

  // 用于调试的状态变量
  const [authDebugInfo, setAuthDebugInfo] = useState({
    isAdmin: null,
    localStorage: {},
    userObject: null,
    checkTime: null
  });
  
  // 强制设置为管理员
  const forceSetAdmin = () => {
    localStorage.setItem('dify_user_role', 'admin');
    message.success('已将角色设置为管理员，正在刷新页面...');
    setTimeout(() => window.location.reload(), 1000);
  };
  
  // 收集调试信息
  const collectDebugInfo = () => {
    // 从 localStorage 获取所有相关的用户信息
    const dify_token = localStorage.getItem('dify_token');
    const dify_user_role = localStorage.getItem('dify_user_role');
    const dify_user_info_raw = localStorage.getItem('dify_user_info');
    
    let dify_user_info = null;
    try {
      if (dify_user_info_raw) {
        dify_user_info = JSON.parse(dify_user_info_raw);
      }
    } catch (e) {
      console.error('解析用户信息失败', e);
    }
    
    // 获取当前的管理员状态
    const adminStatus = isAdmin();
    
    setAuthDebugInfo({
      isAdmin: adminStatus,
      localStorage: {
        dify_token: dify_token ? `${dify_token.substring(0, 10)}...` : null,
        dify_user_role,
        dify_user_info_exists: !!dify_user_info_raw
      },
      userObject: dify_user_info,
      checkTime: new Date().toLocaleString()
    });
    
    console.log('调试信息收集完成：', {
      isAdmin: adminStatus,
      localStorage: {
        dify_user_role,
        has_token: !!dify_token,
        has_user_info: !!dify_user_info_raw
      },
      userObject: dify_user_info
    });
  };
  
  // 模拟数据 - 确保这些数据在组件中有定义
  const mockSources = [
    { id: '1', name: '网络搜索', description: '客户通过网络搜索找到我们' },
    { id: '2', name: '线下推荐', description: '客户通过现有客户推荐' },
    { id: '3', name: '社交媒体', description: '客户通过社交媒体平台找到我们' },
  ];
  
  const mockStatuses = [
    { id: '1', name: '初步接触', description: '初步联系阶段' },
    { id: '2', name: '需求确认', description: '确认客户需求阶段' },
    { id: '3', name: '方案提供', description: '为客户提供解决方案' },
    { id: '4', name: '商务谈判', description: '商务条款协商阶段' },
    { id: '5', name: '已成交', description: '已完成销售' },
    { id: '6', name: '已失败', description: '商机已失败' },
  ];
  
  // 加载模拟数据和收集调试信息 - 修改依赖项
  useEffect(() => {
    console.log('LeadSettings组件已加载');
    console.log('管理员状态:', isAdmin());
    
    // 收集调试信息
    collectDebugInfo();
    
    // 模拟加载数据
    const loadData = async () => {
      try {
        // 设置加载状态
        setSourceLoading(true);
        setStatusLoading(true);
        
        console.log('开始加载模拟数据');
        console.log('模拟数据源项:', mockSources);
        console.log('模拟状态项:', mockStatuses);
        
        // 直接设置数据，不使用setTimeout
        setSources(mockSources);
        setStatuses(mockStatuses);
        setSourceLoading(false);
        setStatusLoading(false);
        console.log('数据加载完成');
      } catch (error) {
        console.error('加载数据失败:', error);
        message.error('加载数据失败，请刷新页面重试');
        setSourceLoading(false);
        setStatusLoading(false);
      }
    };
    
    loadData();
  // 移除isAdmin依赖，防止循环重新渲染
  }, []);
  
  // 打开新增商机来源弹窗
  const showAddSourceModal = () => {
    setEditingSource(null);
    sourceForm.resetFields();
    setSourceModalVisible(true);
  };

  // 打开编辑商机来源弹窗
  const showEditSourceModal = (source) => {
    setEditingSource(source);
    sourceForm.setFieldsValue({
      name: source.name,
      description: source.description || ''
    });
    setSourceModalVisible(true);
  };

  // 打开新增商机状态弹窗
  const showAddStatusModal = () => {
    setEditingStatus(null);
    statusForm.resetFields();
    setStatusModalVisible(true);
  };

  // 打开编辑商机状态弹窗
  const showEditStatusModal = (status) => {
    setEditingStatus(status);
    statusForm.setFieldsValue({
      name: status.name,
      description: status.description || '',
      color: status.color || '#1890ff',
      order: status.order || 0
    });
    setStatusModalVisible(true);
  };

  // 处理商机来源表单提交
  const handleSourceFormSubmit = async () => {
    try {
      const values = await sourceForm.validateFields();
      
      if (editingSource) {
        // 更新现有商机来源（模拟API调用）
        const updatedSources = sources.map(item => 
          item.id === editingSource.id ? {...item, ...values} : item
        );
        setSources(updatedSources);
        message.success('商机来源更新成功');
      } else {
        // 创建新商机来源（模拟API调用）
        const newSource = {
          id: Math.max(0, ...sources.map(s => s.id)) + 1,
          ...values
        };
        setSources([...sources, newSource]);
        message.success('商机来源创建成功');
      }
      
      setSourceModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理商机状态表单提交
  const handleStatusFormSubmit = async () => {
    try {
      const values = await statusForm.validateFields();
      
      if (editingStatus) {
        // 更新现有商机状态（模拟API调用）
        const updatedStatuses = statuses.map(item => 
          item.id === editingStatus.id ? {...item, ...values} : item
        );
        setStatuses(updatedStatuses);
        message.success('商机状态更新成功');
      } else {
        // 创建新商机状态（模拟API调用）
        const newStatus = {
          id: Math.max(0, ...statuses.map(s => s.id)) + 1,
          ...values
        };
        setStatuses([...statuses, newStatus]);
        message.success('商机状态创建成功');
      }
      
      setStatusModalVisible(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 商机来源表格列
  const sourceColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditSourceModal(record)}
          />
        </Space>
      ),
    },
  ];

  // 商机状态表格列
  const statusColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color) => (
        <div style={{ 
          backgroundColor: color || '#1890ff', 
          width: 20, 
          height: 20, 
          borderRadius: '50%' 
        }} />
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditStatusModal(record)}
          />
        </Space>
      ),
    },
  ];

  // 显示调试信息的组件
  const renderDebugInfo = () => (
    <Card title="调试信息" extra={<Button icon={<ReloadOutlined />} onClick={collectDebugInfo}>刷新</Button>}>
      <Alert
        message="权限检查失败"
        description={
          <div>
            <p>您当前被检测为非管理员角色，无法访问商机设置页面。请查看下方调试信息。</p>
            <Button type="primary" danger onClick={forceSetAdmin}>强制设置为管理员</Button>
          </div>
        }
        type="error"
        showIcon
      />
      
      <Divider orientation="left">基本状态</Divider>
      <Descriptions bordered size="small">
        <Descriptions.Item label="检查时间">{authDebugInfo.checkTime}</Descriptions.Item>
        <Descriptions.Item label="管理员状态">
          {authDebugInfo.isAdmin ? 
            <Tag color="green">是</Tag> : 
            <Tag color="red">否</Tag>
          }
        </Descriptions.Item>
      </Descriptions>
      
      <Divider orientation="left">localStorage 存储</Divider>
      <Descriptions bordered size="small">
        <Descriptions.Item label="dify_user_role" span={3}>
          {authDebugInfo.localStorage.dify_user_role || '未设置'}
        </Descriptions.Item>
        <Descriptions.Item label="dify_token" span={3}>
          {authDebugInfo.localStorage.dify_token || '未设置'}
        </Descriptions.Item>
        <Descriptions.Item label="dify_user_info" span={3}>
          {authDebugInfo.localStorage.dify_user_info_exists ? '已设置' : '未设置'}
        </Descriptions.Item>
      </Descriptions>
      
      <Divider orientation="left">用户对象</Divider>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
        {JSON.stringify(authDebugInfo.userObject, null, 2)}
      </pre>
    </Card>
  );
  
  if (!isAdmin()) {
    return (
      <div className="lead-settings-container">
        <Title level={2}>商机设置 - 无法访问</Title>
        <Card>
          <Result
            status="403"
            title="无权访问"
            subTitle="您没有权限访问商机设置页面"
            icon={<BugOutlined />}
            extra={<Button type="primary" danger onClick={forceSetAdmin}>强制设置为管理员</Button>}
          />
        </Card>
        
        {renderDebugInfo()}
      </div>
    );
  }

  return (
    <div className="lead-settings-container">
      <Title level={2}>商机设置</Title>
      <Tabs defaultActiveKey="sources">
        <TabPane tab="商机来源" key="sources">
          <Card 
            title="商机来源管理" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showAddSourceModal}
              >
                新增来源
              </Button>
            }
          >
            <Table 
              columns={sourceColumns} 
              dataSource={sources} 
              rowKey="id" 
              loading={sourceLoading}
              pagination={false}
            />
          </Card>
        </TabPane>
        <TabPane tab="商机状态" key="statuses">
          <Card 
            title="商机状态管理" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showAddStatusModal}
              >
                新增状态
              </Button>
            }
          >
            <Table 
              columns={statusColumns} 
              dataSource={statuses} 
              rowKey="id" 
              loading={statusLoading}
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 商机来源表单对话框 */}
      {/* 商机来源表单弹窗 */}
      <Modal
        title={editingSource ? "编辑商机来源" : "新增商机来源"}
        open={sourceModalVisible}
        onOk={handleSourceFormSubmit}
        onCancel={() => setSourceModalVisible(false)}
        maskClosable={false}
      >
        <Form form={sourceForm} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入商机来源名称' }]}
          >
            <Input placeholder="请输入商机来源名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入商机来源描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 商机状态表单弹窗 */}
      <Modal
        title={editingStatus ? "编辑商机状态" : "新增商机状态"}
        open={statusModalVisible}
        onOk={handleStatusFormSubmit}
        onCancel={() => setStatusModalVisible(false)}
        maskClosable={false}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入商机状态名称' }]}
          >
            <Input placeholder="请输入商机状态名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入商机状态描述" rows={3} />
          </Form.Item>
          <Form.Item
            name="color"
            label="颜色"
            rules={[{ required: true, message: '请选择商机状态颜色' }]}
          >
            <Input type="color" style={{ width: '50px' }} />
          </Form.Item>
          <Form.Item
            name="order"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
            initialValue={0}
          >
            <Input type="number" placeholder="数字越小排序越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeadSettings;
