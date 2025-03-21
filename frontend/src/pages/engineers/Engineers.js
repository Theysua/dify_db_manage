import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Table, 
  Space, 
  Input, 
  Form, 
  Select, 
  Modal, 
  message, 
  Spin,
  Row,
  Col,
  Tooltip,
  Tag,
  Popconfirm,
  Statistic
} from 'antd';
import { 
  ToolOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  AppstoreOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AppleStyle.css';

const { Title } = Typography;
const { Option } = Select;

const Engineers = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [engineerForm] = Form.useForm();
  const [editingEngineerId, setEditingEngineerId] = useState(null);
  
  const navigate = useNavigate();

  // 获取工程师统计信息
  const fetchEngineerStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.get('/api/v1/engineers/statistics/overview');
      setStats(response.data || {});
    } catch (error) {
      console.error('获取工程师统计数据失败:', error);
      // 模拟数据用于 UI 开发
      setStats({
        TotalEngineers: 45,
        ActiveEngineers: 38,
        DeploymentCapacityUtilization: 72,
        SkillDistribution: {
          'AWS': 18,
          'Azure': 12,
          'GCP': 8,
          'On-Premise': 7
        },
        RegionDistribution: {
          '北美': 15,
          '欧洲': 14,
          '亚太': 16
        }
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // 获取工程师列表
  const fetchEngineers = async (page = 1, size = 10, filters = {}) => {
    try {
      setLoading(true);
      const params = { 
        skip: (page - 1) * size, 
        limit: size,
        ...filters
      };
      
      const response = await axios.get('/api/v1/engineers', { params });
      setEngineers(response.data || []);
      setTotal(response.headers['x-total-count'] || response.data.length);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error('获取工程师列表失败:', error);
      // 模拟数据用于 UI 开发
      const mockData = [
        {
          EngineerID: 1,
          Name: '张三',
          Email: 'zhangsan@example.com',
          Phone: '+86 123 4567 8901',
          Specialization: 'AWS',
          Region: '亚太',
          SkillLevel: '高级',
          Status: 'ACTIVE',
          DeploymentCapacity: 5,
          CurrentDeployments: 3,
          JoinDate: '2024-01-15'
        },
        {
          EngineerID: 2,
          Name: '李四',
          Email: 'lisi@example.com',
          Phone: '+86 987 6543 210',
          Specialization: 'Azure',
          Region: '北美',
          SkillLevel: '中级',
          Status: 'ACTIVE',
          DeploymentCapacity: 3,
          CurrentDeployments: 2,
          JoinDate: '2024-02-20'
        },
        {
          EngineerID: 3,
          Name: '王五',
          Email: 'wangwu@example.com',
          Phone: '+86 456 7890 123',
          Specialization: 'GCP',
          Region: '欧洲',
          SkillLevel: '初级',
          Status: 'INACTIVE',
          DeploymentCapacity: 2,
          CurrentDeployments: 0,
          JoinDate: '2024-03-10'
        }
      ];
      setEngineers(mockData);
      setTotal(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    fetchEngineers();
    fetchEngineerStats();
  }, []);

  // 处理搜索
  const handleSearch = (values) => {
    const filters = {};
    Object.keys(values).forEach(key => {
      if (values[key]) {
        filters[key] = values[key];
      }
    });
    fetchEngineers(1, pageSize, filters);
  };

  // 处理表格变化
  const handleTableChange = (pagination) => {
    fetchEngineers(pagination.current, pagination.pageSize, searchForm.getFieldsValue());
  };

  // 新建/编辑工程师弹窗
  const showModal = (record = null) => {
    if (record) {
      setEditingEngineerId(record.EngineerID);
      engineerForm.setFieldsValue({
        Name: record.Name,
        Email: record.Email,
        Phone: record.Phone,
        Specialization: record.Specialization,
        Region: record.Region,
        SkillLevel: record.SkillLevel,
        Status: record.Status,
        DeploymentCapacity: record.DeploymentCapacity
      });
    } else {
      setEditingEngineerId(null);
      engineerForm.resetFields();
      engineerForm.setFieldsValue({ 
        Status: 'ACTIVE',
        DeploymentCapacity: 3,
        SkillLevel: '中级'
      });
    }
    setIsModalVisible(true);
  };

  // 保存工程师
  const handleSaveEngineer = async () => {
    try {
      const values = await engineerForm.validateFields();
      const engineerData = { ...values };
      
      let response;
      if (editingEngineerId) {
        response = await axios.put(`/api/v1/engineers/${editingEngineerId}`, engineerData);
        message.success('工程师信息更新成功');
      } else {
        response = await axios.post('/api/v1/engineers', engineerData);
        message.success('新工程师创建成功');
      }
      
      setIsModalVisible(false);
      fetchEngineers(currentPage, pageSize, searchForm.getFieldsValue());
      fetchEngineerStats();
    } catch (error) {
      console.error('保存工程师信息失败:', error);
      message.error('保存失败，请检查输入并重试');
    }
  };

  // 删除工程师
  const handleDeleteEngineer = async (id) => {
    try {
      await axios.delete(`/api/v1/engineers/${id}`);
      message.success('工程师删除成功');
      fetchEngineers(currentPage, pageSize, searchForm.getFieldsValue());
      fetchEngineerStats();
    } catch (error) {
      console.error('删除工程师失败:', error);
      message.error('删除失败，请稍后重试');
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchEngineers(currentPage, pageSize, searchForm.getFieldsValue());
    fetchEngineerStats();
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'EngineerID',
      key: 'EngineerID',
      sorter: (a, b) => a.EngineerID - b.EngineerID,
    },
    {
      title: '姓名',
      dataIndex: 'Name',
      key: 'Name',
      render: (text, record) => (
        <a onClick={() => navigate(`/engineers/${record.EngineerID}`)}>{text}</a>
      ),
    },
    {
      title: '专业技能',
      dataIndex: 'Specialization',
      key: 'Specialization',
      filters: [
        { text: 'AWS', value: 'AWS' },
        { text: 'Azure', value: 'Azure' },
        { text: 'GCP', value: 'GCP' },
        { text: 'On-Premise', value: 'On-Premise' },
      ],
      onFilter: (value, record) => record.Specialization === value,
    },
    {
      title: '技能等级',
      dataIndex: 'SkillLevel',
      key: 'SkillLevel',
      filters: [
        { text: '高级', value: '高级' },
        { text: '中级', value: '中级' },
        { text: '初级', value: '初级' },
      ],
      onFilter: (value, record) => record.SkillLevel === value,
    },
    {
      title: '区域',
      dataIndex: 'Region',
      key: 'Region',
      filters: [
        { text: '北美', value: '北美' },
        { text: '欧洲', value: '欧洲' },
        { text: '亚太', value: '亚太' },
      ],
      onFilter: (value, record) => record.Region === value,
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_, record) => (
        <Space size="small">
          {record.Email && (
            <Tooltip title={record.Email}>
              <MailOutlined />
            </Tooltip>
          )}
          {record.Phone && (
            <Tooltip title={record.Phone}>
              <PhoneOutlined />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '部署容量',
      key: 'deploymentCapacity',
      render: (_, record) => (
        <div>
          <span>{record.CurrentDeployments || 0} / {record.DeploymentCapacity}</span>
          <div style={{ width: '100%', background: '#f0f0f0', borderRadius: '10px', marginTop: '4px' }}>
            <div 
              style={{ 
                width: `${(record.CurrentDeployments / record.DeploymentCapacity) * 100}%`, 
                background: `${(record.CurrentDeployments / record.DeploymentCapacity) > 0.8 ? 'var(--apple-warning)' : 'var(--apple-success)'}`,
                height: '8px',
                borderRadius: '10px'
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
      render: (status) => {
        if (status === 'ACTIVE') 
          return <Tag color="success" className="apple-badge apple-badge-success">在职</Tag>;
        if (status === 'INACTIVE') 
          return <Tag color="default" className="apple-badge apple-badge-secondary">离职</Tag>;
        return status;
      },
      filters: [
        { text: '在职', value: 'ACTIVE' },
        { text: '离职', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.Status === value,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/engineers/${record.EngineerID}`)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="确定删除该工程师吗？"
            description="删除后无法恢复！"
            onConfirm={() => handleDeleteEngineer(record.EngineerID)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="engineers-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} className="apple-title">工程师管理</Title>
        <Button 
          onClick={handleRefresh} 
          icon={<SyncOutlined />} 
          type="primary"
          className="apple-button apple-button-primary"
          style={{ borderRadius: '20px', height: '36px' }}
        >
          刷新数据
        </Button>
      </div>
      
      {/* 统计卡片 */}
      <Row gutter={24} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card className="apple-card apple-stats-card" bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'rgba(52, 199, 89, 0.1)', 
                borderRadius: '12px', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <TeamOutlined style={{ fontSize: '24px', color: 'var(--apple-success)' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <div style={{ fontSize: '14px', color: 'var(--apple-text-secondary)' }}>工程师总数</div>
                <div style={{ fontSize: '28px', fontWeight: '600' }}>{stats?.TotalEngineers || 0}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="apple-card apple-stats-card" bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'rgba(0, 113, 227, 0.1)', 
                borderRadius: '12px', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <ToolOutlined style={{ fontSize: '24px', color: 'var(--apple-primary)' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <div style={{ fontSize: '14px', color: 'var(--apple-text-secondary)' }}>在职工程师</div>
                <div style={{ fontSize: '28px', fontWeight: '600' }}>{stats?.ActiveEngineers || 0}</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="apple-card apple-stats-card" bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                backgroundColor: 'rgba(255, 149, 0, 0.1)', 
                borderRadius: '12px', 
                width: '48px', 
                height: '48px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <AppstoreOutlined style={{ fontSize: '24px', color: 'var(--apple-warning)' }} />
              </div>
              <div style={{ marginLeft: '16px' }}>
                <div style={{ fontSize: '14px', color: 'var(--apple-text-secondary)' }}>部署采用率</div>
                <div style={{ fontSize: '28px', fontWeight: '600' }}>{stats?.DeploymentCapacityUtilization || 0}%</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 搜索表单 */}
      <Card className="apple-card" bordered={false} style={{ marginBottom: '24px' }}>
        <Form
          form={searchForm}
          layout="horizontal"
          onFinish={handleSearch}
          initialValues={{}}
        >
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name="name" label="工程师姓名">
                <Input placeholder="输入工程师姓名" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="specialization" label="专业技能">
                <Select placeholder="选择技能" allowClear>
                  <Option value="AWS">AWS</Option>
                  <Option value="Azure">Azure</Option>
                  <Option value="GCP">GCP</Option>
                  <Option value="On-Premise">On-Premise</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="region" label="所在区域">
                <Select placeholder="选择区域" allowClear>
                  <Option value="北美">北美</Option>
                  <Option value="欧洲">欧洲</Option>
                  <Option value="亚太">亚太</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    className="apple-button apple-button-primary"
                  >
                    搜索
                  </Button>
                  <Button 
                    onClick={() => {
                      searchForm.resetFields();
                      fetchEngineers();
                    }}
                    className="apple-button"
                  >
                    重置
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={() => showModal()}
                    icon={<PlusOutlined />}
                    className="apple-button apple-button-primary"
                  >
                    新建工程师
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      
      {/* 工程师列表 */}
      <Card className="apple-card" bordered={false}>
        <Table
          dataSource={engineers}
          columns={columns}
          rowKey="EngineerID"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          loading={loading}
          onChange={handleTableChange}
          className="apple-table"
        />
      </Card>
      
      {/* 新建/编辑工程师弹窗 */}
      <Modal
        title={editingEngineerId ? '编辑工程师' : '新建工程师'}
        open={isModalVisible}
        onOk={handleSaveEngineer}
        onCancel={() => setIsModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form
          form={engineerForm}
          layout="vertical"
          initialValues={{ Status: 'ACTIVE', DeploymentCapacity: 3, SkillLevel: '中级' }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item 
                name="Name" 
                label="姓名"
                rules={[{ required: true, message: '请输入工程师姓名' }]}
              >
                <Input placeholder="输入工程师姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="Email" 
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱地址' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="输入邮箱地址" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item 
                name="Phone" 
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="Specialization" 
                label="专业技能"
                rules={[{ required: true, message: '请选择专业技能' }]}
              >
                <Select placeholder="选择技能">
                  <Option value="AWS">AWS</Option>
                  <Option value="Azure">Azure</Option>
                  <Option value="GCP">GCP</Option>
                  <Option value="On-Premise">On-Premise</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item 
                name="Region" 
                label="所在区域"
                rules={[{ required: true, message: '请选择所在区域' }]}
              >
                <Select placeholder="选择区域">
                  <Option value="北美">北美</Option>
                  <Option value="欧洲">欧洲</Option>
                  <Option value="亚太">亚太</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="SkillLevel" 
                label="技能等级"
                rules={[{ required: true, message: '请选择技能等级' }]}
              >
                <Select placeholder="选择技能等级">
                  <Option value="高级">高级</Option>
                  <Option value="中级">中级</Option>
                  <Option value="初级">初级</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item 
                name="DeploymentCapacity" 
                label="部署容量"
                rules={[{ required: true, message: '请输入部署容量' }]}
              >
                <Select placeholder="选择部署容量">
                  <Option value={1}>1</Option>
                  <Option value={2}>2</Option>
                  <Option value={3}>3</Option>
                  <Option value={4}>4</Option>
                  <Option value={5}>5</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="Status" 
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="选择状态">
                  <Option value="ACTIVE">在职</Option>
                  <Option value="INACTIVE">离职</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Engineers;
