import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Spin, 
  Card, 
  message, 
  Form, 
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Modal,
  Typography,
  Tooltip,
  Tag,
  Divider,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const Deployments = () => {
  const [deployments, setDeployments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deploymentForm] = Form.useForm();
  const [licenses, setLicenses] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [editingDeploymentId, setEditingDeploymentId] = useState(null);
  
  const navigate = useNavigate();

  const fetchDeploymentStats = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.get('/api/v1/deployments/statistics');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch deployment statistics:', error);
      message.error('获取部署统计信息失败');
      // Mock data
      setStats({
        TotalDeployments: 25,
        CompletedDeployments: 18,
        PlannedDeployments: 5,
        FailedDeployments: 2,
        AverageDeploymentTime: 3.5,
        DeploymentsByType: { 
          INITIAL: 15, 
          UPDATE: 7,
          MIGRATION: 2,
          REINSTALLATION: 1
        }
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchDeployments = async (page = 1, size = 10, filters = {}) => {
    try {
      setLoading(true);
      const params = { 
        skip: (page - 1) * size, 
        limit: size,
        ...filters
      };
      
      const response = await axios.get('/api/v1/deployments', { params });
      setDeployments(response.data || []);
      setTotal(response.headers['x-total-count'] || response.data.length);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
      message.error('获取部署记录失败');
      // Mock data
      const mockData = [
        {
          DeploymentID: 1,
          LicenseID: 'ENT-2025-001',
          DeploymentType: 'INITIAL',
          DeploymentDate: '2025-01-15',
          DeployedBy: '工程师1',
          DeploymentStatus: 'COMPLETED',
          DeploymentEnvironment: '生产环境',
          CompletionDate: '2025-01-16',
          Notes: '初始部署完成'
        },
        {
          DeploymentID: 2,
          LicenseID: 'ENT-2025-002',
          DeploymentType: 'INITIAL',
          DeploymentDate: '2025-02-15',
          DeployedBy: '工程师2',
          DeploymentStatus: 'PLANNED',
          DeploymentEnvironment: '测试环境',
          CompletionDate: null,
          Notes: '计划中的部署'
        }
      ];
      setDeployments(mockData);
      setTotal(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      // These endpoints need to be implemented
      const [licensesRes, engineersRes] = await Promise.all([
        axios.get('/api/v1/licenses'),
        axios.get('/api/v1/engineers')
      ]);
      
      setLicenses(licensesRes.data || []);
      setEngineers(engineersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch reference data:', error);
      // Mock data
      setLicenses([
        { LicenseID: 'ENT-2025-001', CustomerName: '测试客户1' },
        { LicenseID: 'ENT-2025-002', CustomerName: '测试客户2' }
      ]);
      setEngineers([
        { EngineerID: 1, EngineerName: '工程师1' },
        { EngineerID: 2, EngineerName: '工程师2' }
      ]);
    }
  };

  useEffect(() => {
    fetchDeploymentStats();
    fetchDeployments();
    fetchReferenceData();
  }, []);

  const handleSearch = (values) => {
    const filters = {};
    
    if (values.deploymentId) {
      filters.deployment_id = values.deploymentId;
    }
    
    if (values.licenseId) {
      filters.license_id = values.licenseId;
    }
    
    if (values.deploymentType) {
      filters.deployment_type = values.deploymentType;
    }
    
    if (values.deploymentStatus) {
      filters.deployment_status = values.deploymentStatus;
    }
    
    if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
      filters.start_date = values.dateRange[0].format('YYYY-MM-DD');
      filters.end_date = values.dateRange[1].format('YYYY-MM-DD');
    }
    
    fetchDeployments(1, pageSize, filters);
  };

  const handleReset = () => {
    searchForm.resetFields();
    fetchDeployments(1, pageSize);
  };

  const showModal = (deploymentId = null) => {
    setEditingDeploymentId(deploymentId);
    
    if (deploymentId) {
      // Get deployment details for editing
      const deployment = deployments.find(dep => dep.DeploymentID === deploymentId);
      if (deployment) {
        deploymentForm.setFieldsValue({
          licenseId: deployment.LicenseID,
          deploymentType: deployment.DeploymentType,
          deploymentDate: moment(deployment.DeploymentDate),
          deployedBy: deployment.DeployedBy,
          deploymentStatus: deployment.DeploymentStatus,
          deploymentEnvironment: deployment.DeploymentEnvironment,
          serverInfo: deployment.ServerInfo,
          completionDate: deployment.CompletionDate ? moment(deployment.CompletionDate) : null,
          notes: deployment.Notes,
          engineerAssignments: deployment.EngineerAssignments?.map(e => e.EngineerID) || []
        });
      }
    } else {
      deploymentForm.resetFields();
      deploymentForm.setFieldsValue({
        deploymentDate: moment(),
        deploymentStatus: 'PLANNED'
      });
    }
    
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    deploymentForm.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await deploymentForm.validateFields();
      
      const deploymentData = {
        LicenseID: values.licenseId,
        DeploymentType: values.deploymentType,
        DeploymentDate: values.deploymentDate.format('YYYY-MM-DD'),
        DeployedBy: values.deployedBy,
        DeploymentStatus: values.deploymentStatus,
        DeploymentEnvironment: values.deploymentEnvironment,
        ServerInfo: values.serverInfo,
        CompletionDate: values.completionDate ? values.completionDate.format('YYYY-MM-DD') : null,
        Notes: values.notes,
        EngineerAssignments: values.engineerAssignments?.map(id => ({ EngineerID: id })) || []
      };
      
      if (editingDeploymentId) {
        // Update
        await axios.put(`/api/v1/deployments/${editingDeploymentId}`, deploymentData);
        message.success('部署记录更新成功');
      } else {
        // Create
        await axios.post('/api/v1/deployments', deploymentData);
        message.success('部署记录创建成功');
      }
      
      setIsModalVisible(false);
      fetchDeployments(currentPage, pageSize);
      fetchDeploymentStats();
    } catch (error) {
      console.error('Failed to submit deployment:', error);
      message.error(editingDeploymentId ? '更新部署记录失败' : '创建部署记录失败');
    }
  };

  const handleDelete = async (deploymentId) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部署记录 ${deploymentId} 吗？此操作不可逆。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await axios.delete(`/api/v1/deployments/${deploymentId}`);
          message.success('部署记录删除成功');
          fetchDeployments(currentPage, pageSize);
          fetchDeploymentStats();
        } catch (error) {
          console.error('Failed to delete deployment:', error);
          message.error('删除部署记录失败');
        }
      }
    });
  };

  const getDeploymentStatusTag = (status) => {
    if (status === 'COMPLETED') {
      return <Tag color="green">已完成</Tag>;
    } else if (status === 'IN_PROGRESS') {
      return <Tag color="blue">进行中</Tag>;
    } else if (status === 'PLANNED') {
      return <Tag color="gold">已计划</Tag>;
    } else if (status === 'FAILED') {
      return <Tag color="red">失败</Tag>;
    }
    return <Tag>{status}</Tag>;
  };

  const getDeploymentTypeText = (type) => {
    const typeMap = {
      'INITIAL': '初始部署',
      'UPDATE': '更新',
      'MIGRATION': '迁移',
      'REINSTALLATION': '重新安装'
    };
    return typeMap[type] || type;
  };

  const columns = [
    {
      title: '部署ID',
      dataIndex: 'DeploymentID',
      key: 'DeploymentID',
    },
    {
      title: '许可证ID',
      dataIndex: 'LicenseID',
      key: 'LicenseID',
      render: (text) => <a onClick={() => navigate(`/licenses/${text}`)}>{text}</a>,
    },
    {
      title: '部署类型',
      dataIndex: 'DeploymentType',
      key: 'DeploymentType',
      render: (type) => getDeploymentTypeText(type),
    },
    {
      title: '部署日期',
      dataIndex: 'DeploymentDate',
      key: 'DeploymentDate',
    },
    {
      title: '部署人员',
      dataIndex: 'DeployedBy',
      key: 'DeployedBy',
    },
    {
      title: '部署环境',
      dataIndex: 'DeploymentEnvironment',
      key: 'DeploymentEnvironment',
    },
    {
      title: '状态',
      dataIndex: 'DeploymentStatus',
      key: 'DeploymentStatus',
      render: (status) => getDeploymentStatusTag(status),
    },
    {
      title: '完成日期',
      dataIndex: 'CompletionDate',
      key: 'CompletionDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => navigate(`/deployments/${record.DeploymentID}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => showModal(record.DeploymentID)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={() => handleDelete(record.DeploymentID)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="deployments-container">
      <div className="page-header">
        <Title level={2}>部署管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          新建部署
        </Button>
      </div>
      
      <Card className="stats-card">
        <Spin spinning={statsLoading}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="总部署数"
                value={stats.TotalDeployments || 0}
                className="dashboard-statistic"
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="已完成部署" 
                value={stats.CompletedDeployments || 0} 
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
                className="dashboard-statistic"
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="已计划部署" 
                value={stats.PlannedDeployments || 0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ClockCircleOutlined />}
                className="dashboard-statistic"
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="失败部署" 
                value={stats.FailedDeployments || 0}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
                className="dashboard-statistic"
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="平均部署时间 (天)"
                value={stats.AverageDeploymentTime || 0}
                precision={1}
                className="dashboard-statistic"
              />
            </Col>
            <Col span={12}>
              <Card size="small" title="部署类型分布">
                <Row gutter={8}>
                  {stats.DeploymentsByType && Object.entries(stats.DeploymentsByType).map(([type, count]) => (
                    <Col span={6} key={type}>
                      <Statistic 
                        title={getDeploymentTypeText(type)} 
                        value={count} 
                        className="dashboard-statistic"
                      />
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
        </Spin>
      </Card>
      
      <Card className="search-form">
        <Form
          form={searchForm}
          name="deployment_search"
          layout="horizontal"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="deploymentId" label="部署ID">
                <Input placeholder="输入部署ID" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="licenseId" label="许可证ID">
                <Input placeholder="输入许可证ID" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="deploymentType" label="部署类型">
                <Select placeholder="选择部署类型" allowClear>
                  <Option value="INITIAL">初始部署</Option>
                  <Option value="UPDATE">更新</Option>
                  <Option value="MIGRATION">迁移</Option>
                  <Option value="REINSTALLATION">重新安装</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="deploymentStatus" label="部署状态">
                <Select placeholder="选择状态" allowClear>
                  <Option value="COMPLETED">已完成</Option>
                  <Option value="IN_PROGRESS">进行中</Option>
                  <Option value="PLANNED">已计划</Option>
                  <Option value="FAILED">失败</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dateRange" label="时间范围">
                <DatePicker.RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button 
                style={{ marginLeft: 8 }} 
                onClick={handleReset}
              >
                重置
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={deployments}
          rowKey="DeploymentID"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (page, size) => {
              fetchDeployments(page, size);
            },
            onShowSizeChange: (current, size) => {
              setPageSize(size);
              fetchDeployments(current, size);
            },
          }}
        />
      </Card>

      <Modal
        title={editingDeploymentId ? "编辑部署记录" : "创建新部署"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        maskClosable={false}
      >
        <Form
          form={deploymentForm}
          layout="vertical"
          name="deployment_form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="licenseId"
                label="许可证"
                rules={[{ required: true, message: '请选择许可证' }]}
              >
                <Select placeholder="选择许可证">
                  {licenses.map(l => (
                    <Option key={l.LicenseID} value={l.LicenseID}>{`${l.LicenseID} - ${l.CustomerName || ''}`}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deploymentType"
                label="部署类型"
                rules={[{ required: true, message: '请选择部署类型' }]}
              >
                <Select placeholder="选择部署类型">
                  <Option value="INITIAL">初始部署</Option>
                  <Option value="UPDATE">更新</Option>
                  <Option value="MIGRATION">迁移</Option>
                  <Option value="REINSTALLATION">重新安装</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="deploymentDate"
                label="部署日期"
                rules={[{ required: true, message: '请选择部署日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deployedBy"
                label="部署人员"
                rules={[{ required: true, message: '请输入部署人员' }]}
              >
                <Input placeholder="输入部署人员或团队" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="deploymentStatus"
                label="部署状态"
                rules={[{ required: true, message: '请选择部署状态' }]}
              >
                <Select placeholder="选择部署状态">
                  <Option value="PLANNED">已计划</Option>
                  <Option value="IN_PROGRESS">进行中</Option>
                  <Option value="COMPLETED">已完成</Option>
                  <Option value="FAILED">失败</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deploymentEnvironment"
                label="部署环境"
              >
                <Input placeholder="例如: 生产环境, 测试环境等" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="serverInfo"
                label="服务器信息"
              >
                <Input placeholder="输入服务器或基础设施信息" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="completionDate"
                label="完成日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="engineerAssignments"
            label="工程师分配"
          >
            <Select 
              mode="multiple" 
              placeholder="选择分配的工程师"
              style={{ width: '100%' }}
            >
              {engineers.map(e => (
                <Option key={e.EngineerID} value={e.EngineerID}>{e.EngineerName}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={4} placeholder="输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Deployments;
