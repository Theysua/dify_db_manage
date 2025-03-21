import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Licenses = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [licenseForm] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [resellers, setResellers] = useState([]);
  const [editingLicenseId, setEditingLicenseId] = useState(null);
  
  const navigate = useNavigate();

  const fetchLicenses = async (page = 1, size = 10, filters = {}) => {
    try {
      setLoading(true);
      const params = { 
        skip: (page - 1) * size, 
        limit: size,
        ...filters
      };
      
      const response = await axios.get('/api/v1/licenses', { params });
      setLicenses(response.data || []);
      setTotal(response.headers['x-total-count'] || response.data.length);
      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error('Failed to fetch licenses:', error);
      message.error('获取许可证列表失败');
      // Mock data for UI development
      const mockData = [
        {
          LicenseID: 'ENT-2025-001',
          CustomerName: '测试客户1',
          SalesRepName: '销售代表1',
          ProductName: '产品A',
          LicenseType: '企业版',
          StartDate: '2025-01-01',
          ExpiryDate: '2026-01-01',
          AuthorizedUsers: 100,
          ActualUsers: 75,
          DeploymentStatus: 'COMPLETED',
          LicenseStatus: 'ACTIVE'
        },
        {
          LicenseID: 'ENT-2025-002',
          CustomerName: '测试客户2',
          SalesRepName: '销售代表2',
          ProductName: '产品B',
          LicenseType: '企业版',
          StartDate: '2025-02-01',
          ExpiryDate: '2026-02-01',
          AuthorizedUsers: 50,
          ActualUsers: 30,
          DeploymentStatus: 'PLANNED',
          LicenseStatus: 'ACTIVE'
        }
      ];
      setLicenses(mockData);
      setTotal(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      // These endpoints need to be implemented
      const [customersRes, salesRepsRes, resellersRes] = await Promise.all([
        axios.get('/api/v1/customers'),
        axios.get('/api/v1/sales-reps'),
        axios.get('/api/v1/resellers')
      ]);
      
      setCustomers(customersRes.data || []);
      setSalesReps(salesRepsRes.data || []);
      setResellers(resellersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch reference data:', error);
      // Mock data
      setCustomers([
        { CustomerID: 1, CustomerName: '测试客户1' },
        { CustomerID: 2, CustomerName: '测试客户2' }
      ]);
      setSalesReps([
        { SalesRepID: 1, SalesRepName: '销售代表1' },
        { SalesRepID: 2, SalesRepName: '销售代表2' }
      ]);
      setResellers([
        { ResellerID: 1, ResellerName: '代理商1' },
        { ResellerID: 2, ResellerName: '代理商2' }
      ]);
    }
  };

  useEffect(() => {
    fetchLicenses();
    fetchReferenceData();
  }, []);

  const handleSearch = (values) => {
    const filters = {};
    
    if (values.licenseId) {
      filters.license_id = values.licenseId;
    }
    
    if (values.customerName) {
      filters.customer_name = values.customerName;
    }
    
    if (values.productName) {
      filters.product_name = values.productName;
    }
    
    if (values.licenseStatus) {
      filters.license_status = values.licenseStatus;
    }
    
    if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
      filters.start_date = values.dateRange[0].format('YYYY-MM-DD');
      filters.end_date = values.dateRange[1].format('YYYY-MM-DD');
    }
    
    fetchLicenses(1, pageSize, filters);
  };

  const handleReset = () => {
    searchForm.resetFields();
    fetchLicenses(1, pageSize);
  };

  const showModal = (licenseId) => {
    if (!licenseId) {
      message.info('请通过运营工作台创建新许可证');
      return;
    }
    
    setEditingLicenseId(licenseId);
    
    // Get license details for editing
    const license = licenses.find(lic => lic.LicenseID === licenseId);
    if (license) {
      licenseForm.setFieldsValue({
        licenseId: license.LicenseID,
        customerId: license.CustomerID,
        salesRepId: license.SalesRepID,
        resellerId: license.ResellerID,
        productName: "Dify Enterprise",
        licenseType: license.LicenseType,
        orderDate: moment(license.OrderDate),
        startDate: moment(license.StartDate),
        expiryDate: moment(license.ExpiryDate),
        authorizedWorkspaces: license.AuthorizedWorkspaces,
        authorizedUsers: license.AuthorizedUsers,
        actualWorkspaces: license.ActualWorkspaces || 0,
        actualUsers: license.ActualUsers || 0,
        notes: license.Notes
      });
      
      setIsModalVisible(true);
    } else {
      message.error('无法找到该许可证的详细信息');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    licenseForm.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await licenseForm.validateFields();
      
      // We don't allow modifying the license ID
      const licenseData = {
        CustomerID: values.customerId,
        SalesRepID: values.salesRepId,
        ResellerID: values.resellerId,
        ProductName: 'Dify Enterprise',
        LicenseType: values.licenseType,
        OrderDate: values.orderDate.format('YYYY-MM-DD'),
        StartDate: values.startDate.format('YYYY-MM-DD'),
        ExpiryDate: values.expiryDate.format('YYYY-MM-DD'),
        AuthorizedWorkspaces: values.authorizedWorkspaces,
        AuthorizedUsers: values.authorizedUsers,
        ActualWorkspaces: values.actualWorkspaces,
        ActualUsers: values.actualUsers,
        Notes: values.notes
      };
      
      // Only update is allowed - no creation
      if (editingLicenseId) {
        await axios.put(`/api/v1/licenses/${editingLicenseId}`, licenseData);
        message.success('许可证更新成功');
        setIsModalVisible(false);
        fetchLicenses(currentPage, pageSize);
      }
    } catch (error) {
      console.error('Failed to update license:', error);
      message.error('更新许可证失败');
    }
  };

  const handleDelete = async (licenseId) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除许可证 ${licenseId} 吗？此操作不可逆。`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await axios.delete(`/api/v1/licenses/${licenseId}`);
          message.success('许可证删除成功');
          fetchLicenses(currentPage, pageSize);
        } catch (error) {
          console.error('Failed to delete license:', error);
          message.error('删除许可证失败');
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

  const getLicenseStatusTag = (status) => {
    if (status === 'ACTIVE') {
      return <Tag color="green">有效</Tag>;
    } else if (status === 'EXPIRED') {
      return <Tag color="red">已过期</Tag>;
    } else if (status === 'TERMINATED') {
      return <Tag color="volcano">已终止</Tag>;
    } else if (status === 'PENDING') {
      return <Tag color="gold">待激活</Tag>;
    }
    return <Tag>{status}</Tag>;
  };

  const columns = [
    {
      title: '许可证ID',
      dataIndex: 'LicenseID',
      key: 'LicenseID',
      render: (text) => <a onClick={() => navigate(`/licenses/${text}`)}>{text}</a>,
    },
    {
      title: '客户',
      dataIndex: 'CustomerName',
      key: 'CustomerName',
    },
    {
      title: '产品',
      dataIndex: 'ProductName',
      key: 'ProductName',
      render: () => 'Dify Enterprise',
    },
    {
      title: '许可类型',
      dataIndex: 'LicenseType',
      key: 'LicenseType',
    },
    {
      title: '开始日期',
      dataIndex: 'StartDate',
      key: 'StartDate',
    },
    {
      title: '到期日期',
      dataIndex: 'ExpiryDate',
      key: 'ExpiryDate',
    },
    {
      title: '授权工作区',
      dataIndex: 'AuthorizedWorkspaces',
      key: 'AuthorizedWorkspaces',
    },
    {
      title: '实际工作区',
      dataIndex: 'ActualWorkspaces',
      key: 'ActualWorkspaces',
      render: (text) => text || 0,
    },
    {
      title: '授权用户数',
      dataIndex: 'AuthorizedUsers',
      key: 'AuthorizedUsers',
    },
    {
      title: '实际用户数',
      dataIndex: 'ActualUsers',
      key: 'ActualUsers',
      render: (text) => text || 0,
    },
    {
      title: '部署状态',
      dataIndex: 'DeploymentStatus',
      key: 'DeploymentStatus',
      render: (status) => getDeploymentStatusTag(status),
    },
    {
      title: '许可状态',
      dataIndex: 'LicenseStatus',
      key: 'LicenseStatus',
      render: (status) => getLicenseStatusTag(status),
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
              onClick={() => navigate(`/licenses/${record.LicenseID}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => showModal(record.LicenseID)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={() => handleDelete(record.LicenseID)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="licenses-container">
      <div className="page-header">
        <Title level={2}>许可证查询与管理</Title>
        <Tooltip title="请在运营工作台创建新许可证">
          <Button 
            type="default" 
            icon={<InfoCircleOutlined />} 
            onClick={() => navigate('/operations')}
          >
            前往运营工作台
          </Button>
        </Tooltip>
      </div>
      
      <Card className="search-form">
        <Form
          form={searchForm}
          name="license_search"
          layout="horizontal"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="licenseId" label="许可证ID">
                <Input placeholder="输入许可证ID" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="customerName" label="客户名称">
                <Input placeholder="输入客户名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="productName" label="产品名称">
                <Input placeholder="输入产品名称" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="licenseStatus" label="许可状态">
                <Select placeholder="选择状态" allowClear>
                  <Option value="ACTIVE">有效</Option>
                  <Option value="EXPIRED">已过期</Option>
                  <Option value="TERMINATED">已终止</Option>
                  <Option value="PENDING">待激活</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dateRange" label="时间范围">
                <RangePicker style={{ width: '100%' }} />
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
          dataSource={licenses}
          rowKey="LicenseID"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (page, size) => {
              fetchLicenses(page, size);
            },
            onShowSizeChange: (current, size) => {
              setPageSize(size);
              fetchLicenses(current, size);
            },
          }}
        />
      </Card>

      <Modal
        title="编辑许可证"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        maskClosable={false}
      >
        <Form
          form={licenseForm}
          layout="vertical"
          name="license_form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="licenseId"
                label="许可证ID"
                tooltip="许可证ID不可修改"
              >
                <Input disabled={true} placeholder="许可证ID不可修改" style={{ backgroundColor: '#f5f5f5' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="客户"
                rules={[{ required: true, message: '请选择客户' }]}
              >
                <Select placeholder="选择客户">
                  {customers.map(c => (
                    <Option key={c.CustomerID} value={c.CustomerID}>{c.CustomerName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="salesRepId"
                label="销售代表"
              >
                <Select placeholder="选择销售代表" allowClear>
                  {salesReps.map(s => (
                    <Option key={s.SalesRepID} value={s.SalesRepID}>{s.SalesRepName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="resellerId"
                label="代理商"
              >
                <Select placeholder="选择代理商" allowClear>
                  {resellers.map(r => (
                    <Option key={r.ResellerID} value={r.ResellerID}>{r.ResellerName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="productName"
                label="产品名称"
                initialValue="Dify Enterprise"
              >
                <Input 
                  placeholder="Dify Enterprise" 
                  disabled={true} 
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="licenseType"
                label="许可类型"
                rules={[{ required: true, message: '请输入许可类型' }]}
              >
                <Select placeholder="选择许可类型">
                  <Option value="TRIAL">试用版</Option>
                  <Option value="STANDARD">标准版</Option>
                  <Option value="ENTERPRISE">企业版</Option>
                  <Option value="PREMIUM">高级版</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderDate"
                label="订单日期"
                rules={[{ required: true, message: '请选择订单日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="到期日期"
                rules={[{ required: true, message: '请选择到期日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="authorizedWorkspaces"
                label="授权工作区"
                rules={[{ type: 'number', min: 0, message: '不能小于0' }]}
              >
                <Input type="number" placeholder="输入授权工作区数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="authorizedUsers"
                label="授权用户"
                rules={[{ type: 'number', min: 0, message: '不能小于0' }]}
              >
                <Input type="number" placeholder="输入授权用户数量" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actualWorkspaces"
                label="实际工作区"
                rules={[{ type: 'number', min: 0, message: '不能小于0' }]}
                initialValue={0}
              >
                <Input type="number" placeholder="输入实际工作区数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actualUsers"
                label="实际用户"
                rules={[{ type: 'number', min: 0, message: '不能小于0' }]}
                initialValue={0}
              >
                <Input type="number" placeholder="输入实际用户数量" />
              </Form.Item>
            </Col>
          </Row>
          
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

export default Licenses;
