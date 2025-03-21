import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Spin, 
  message, 
  Typography, 
  Tag, 
  Row, 
  Col, 
  Divider,
  Modal,
  Table
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined,
  FileTextOutlined,
  UserOutlined,
  LaptopOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

const DeploymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [engineerAssignments, setEngineerAssignments] = useState([]);

  useEffect(() => {
    const fetchDeployment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/deployments/${id}`);
        setDeployment(response.data);
        setEngineerAssignments(response.data.EngineerAssignments || []);
      } catch (error) {
        console.error('Failed to fetch deployment details:', error);
        message.error('获取部署详情失败');
        // Mock data for UI development
        const mockData = {
          DeploymentID: parseInt(id),
          LicenseID: 'ENT-2025-001',
          DeploymentType: 'INITIAL',
          DeploymentDate: '2025-01-15',
          DeployedBy: '工程师团队',
          DeploymentStatus: 'COMPLETED',
          DeploymentEnvironment: '生产环境',
          ServerInfo: 'Ubuntu 24.04 LTS, 16 CPU, 64GB RAM',
          CompletionDate: '2025-01-16',
          Notes: '初始部署完成，所有功能正常运行。',
          EngineerAssignments: [
            { EngineerID: 1, EngineerName: '张工程师', Role: '主要负责人', Tasks: '环境配置, 安装' },
            { EngineerID: 2, EngineerName: '李工程师', Role: '支持工程师', Tasks: '数据迁移, 测试' }
          ],
          CreatedAt: '2025-01-14T08:00:00',
          UpdatedAt: '2025-01-16T16:30:00'
        };
        setDeployment(mockData);
        setEngineerAssignments(mockData.EngineerAssignments || []);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployment();
  }, [id]);

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部署记录 ${id} 吗？此操作不可逆。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await axios.delete(`/api/v1/deployments/${id}`);
          message.success('部署记录删除成功');
          navigate('/deployments');
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

  const engineerColumns = [
    {
      title: '工程师ID',
      dataIndex: 'EngineerID',
      key: 'EngineerID',
    },
    {
      title: '工程师姓名',
      dataIndex: 'EngineerName',
      key: 'EngineerName',
    },
    {
      title: '角色',
      dataIndex: 'Role',
      key: 'Role',
    },
    {
      title: '任务',
      dataIndex: 'Tasks',
      key: 'Tasks',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!deployment) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger">未找到部署记录，ID: {id}</Text>
        <br />
        <Button type="primary" onClick={() => navigate('/deployments')} style={{ marginTop: '20px' }}>
          返回部署列表
        </Button>
      </div>
    );
  }

  return (
    <div className="deployment-detail-container">
      <div className="page-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/deployments')}>
            返回
          </Button>
          <Title level={2} style={{ margin: 0 }}>部署详情</Title>
        </Space>
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/deployments/edit/${id}`)}
          >
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={handleDelete}
          >
            删除
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card className="detail-card">
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="部署ID">{deployment.DeploymentID}</Descriptions.Item>
              <Descriptions.Item label="许可证ID">
                <a onClick={() => navigate(`/licenses/${deployment.LicenseID}`)}>{deployment.LicenseID}</a>
              </Descriptions.Item>
              <Descriptions.Item label="部署类型">
                {getDeploymentTypeText(deployment.DeploymentType)}
              </Descriptions.Item>
              <Descriptions.Item label="部署状态">
                {getDeploymentStatusTag(deployment.DeploymentStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="部署日期" span={2}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                {deployment.DeploymentDate}
              </Descriptions.Item>
              <Descriptions.Item label="部署人员" span={2}>
                <UserOutlined style={{ marginRight: 8 }} />
                {deployment.DeployedBy}
              </Descriptions.Item>
              {deployment.CompletionDate && (
                <Descriptions.Item label="完成日期" span={2}>
                  <CheckCircleOutlined style={{ marginRight: 8 }} />
                  {deployment.CompletionDate}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="创建时间">
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                {deployment.CreatedAt}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                {deployment.UpdatedAt}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card className="detail-card" title="环境信息">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="部署环境">
                <LaptopOutlined style={{ marginRight: 8 }} />
                {deployment.DeploymentEnvironment || '未指定'}
              </Descriptions.Item>
              <Descriptions.Item label="服务器信息">
                {deployment.ServerInfo || '未指定'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card className="detail-card" title="备注">
            <div style={{ padding: '16px' }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              {deployment.Notes || '无备注信息'}
            </div>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">工程师分配</Divider>
      
      <Card className="detail-card">
        <Table
          dataSource={engineerAssignments}
          columns={engineerColumns}
          rowKey="EngineerID"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default DeploymentDetail;
