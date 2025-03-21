import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Space, message, Modal, Form, Select, Badge,
  Typography, Card, Statistic, Row, Col, Tooltip, Tag, Divider
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, 
  BarChartOutlined, ReloadOutlined, QuestionCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import config from '../../config';

const { Title, Text } = Typography;
const { Option } = Select;

const SalesReps = () => {
  const [salesReps, setSalesReps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchName, setSearchName] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState(null);
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [performanceVisible, setPerformanceVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);

  // 获取销售人员列表
  const fetchSalesReps = async (page = current, size = pageSize) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('skip', (page - 1) * size);
      params.append('limit', size);
      
      if (searchName) params.append('name', searchName);
      if (searchDepartment) params.append('department', searchDepartment);
      if (searchStatus) params.append('status', searchStatus);
      
      // 确保 URL 以斜杠结尾，以匹配 FastAPI 预期
      console.log(`发送请求: ${config.apiBaseUrl}/sales-reps/?${params.toString()}`);
      
      const response = await axios.get(`${config.apiBaseUrl}/sales-reps/?${params.toString()}`, {
        // 确保我们可以访问自定义响应头
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('API Response:', response.data);
      console.log('Response Headers:', response.headers);
      
      // 显示所有响应头
      Object.keys(response.headers).forEach(key => {
        console.log(`Header ${key}:`, response.headers[key]);
      });
      
      setSalesReps(response.data);
      
      // 从响应头中读取总记录数
      const totalCount = parseInt(response.headers['x-total-count'], 10);
      console.log('X-Total-Count header:', response.headers['x-total-count']);
      console.log('Parsed total count:', totalCount);
      
      // 如果有有效值就用，否则使用当前数据长度
      if (!isNaN(totalCount)) {
        setTotal(totalCount);
        console.log('设置总记录数为:', totalCount);
      } else {
        setTotal(response.data.length);
        console.log('无法获取总记录数，使用数据长度:', response.data.length);
      }
      
      // 提取不同的部门，用于筛选
      const uniqueDepartments = [...new Set(response.data
        .map(rep => rep.Department)
        .filter(department => department))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      message.error('获取销售人员列表失败');
      console.error('获取销售人员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReps();
  }, []);

  // 获取销售人员业绩
  const fetchPerformance = async (salesRepId) => {
    setPerformanceLoading(true);
    try {
      const response = await axios.get(`${config.apiBaseUrl}/sales-reps/${salesRepId}/performance`);
      setPerformanceData(response.data);
      setPerformanceVisible(true);
    } catch (error) {
      message.error('获取销售业绩数据失败');
      console.error('获取销售业绩失败:', error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'SalesRepID',
      key: 'SalesRepID',
      width: 60,
      sorter: (a, b) => a.SalesRepID - b.SalesRepID,
    },
    {
      title: '姓名',
      dataIndex: 'SalesRepName',
      key: 'SalesRepName',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <a href="#!" onClick={(e) => { e.preventDefault(); handleViewDetails(record); }}>{text}</a>
        </Space>
      ),
    },
    {
      title: '联系方式',
      dataIndex: 'Email',
      key: 'Email',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <MailOutlined />
            <Text copyable>{text}</Text>
          </Space>
          {record.Phone && (
            <Space>
              <PhoneOutlined />
              <Text copyable>{record.Phone}</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: '部门',
      dataIndex: 'Department',
      key: 'Department',
      render: (text) => (
        <Space>
          <TeamOutlined />
          <span>{text || '暂无'}</span>
        </Space>
      ),
      filters: departments.map(dept => ({ text: dept, value: dept })),
      onFilter: (value, record) => record.Department === value,
    },
    {
      title: '职位',
      dataIndex: 'Position',
      key: 'Position',
      render: (text) => text || '暂无',
    },
    {
      title: '状态',
      dataIndex: 'Status',
      key: 'Status',
      render: (status) => (
        <Badge 
          status={status === 'ACTIVE' ? 'success' : 'default'} 
          text={status === 'ACTIVE' ? '在职' : '离职'}
        />
      ),
      filters: [
        { text: '在职', value: 'ACTIVE' },
        { text: '离职', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.Status === value,
    },
    {
      title: '创建时间',
      dataIndex: 'CreatedAt',
      key: 'CreatedAt',
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="查看业绩">
            <Button 
              type="text" 
              icon={<BarChartOutlined />} 
              onClick={() => fetchPerformance(record.SalesRepID)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 处理搜索
  const handleSearch = () => {
    setCurrent(1);  // 重置到第一页
    fetchSalesReps(1, pageSize);
  };

  // 处理重置搜索
  const handleReset = () => {
    setSearchName('');
    setSearchDepartment('');
    setSearchStatus('');
    setCurrent(1);
    fetchSalesReps(1, pageSize);
  };

  // 处理查看详情
  const handleViewDetails = (record) => {
    setSelectedSalesRep(record);
    form.setFieldsValue({
      SalesRepName: record.SalesRepName,
      Email: record.Email,
      Phone: record.Phone,
      Department: record.Department,
      Position: record.Position,
      Status: record.Status,
    });
    setIsModalVisible(true);
  };

  // 处理编辑
  const handleEdit = (record) => {
    setSelectedSalesRep(record);
    form.setFieldsValue({
      SalesRepName: record.SalesRepName,
      Email: record.Email,
      Phone: record.Phone,
      Department: record.Department,
      Position: record.Position,
      Status: record.Status,
    });
    setIsModalVisible(true);
  };

  // 处理添加新销售人员
  const handleAdd = () => {
    setSelectedSalesRep(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理删除
  const handleDelete = (record) => {
    setSelectedSalesRep(record);
    setIsDeleteModalVisible(true);
  };

  // 执行删除操作
  const confirmDelete = async () => {
    try {
      await axios.delete(`${config.apiBaseUrl}/sales-reps/${selectedSalesRep.SalesRepID}`);
      message.success('销售人员删除成功');
      fetchSalesReps();
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error('删除销售人员失败');
      console.error('删除销售人员失败:', error);
    }
  };

  // 确认提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedSalesRep) {
        // 更新
        await axios.put(`${config.apiBaseUrl}/sales-reps/${selectedSalesRep.SalesRepID}`, values);
        message.success('销售人员信息更新成功');
      } else {
        // 创建
        await axios.post(`${config.apiBaseUrl}/sales-reps`, values);
        message.success('销售人员创建成功');
      }
      
      setIsModalVisible(false);
      fetchSalesReps();
    } catch (error) {
      if (error.response) {
        message.error(`操作失败: ${error.response.data.detail || '未知错误'}`);
      } else if (error.request) {
        message.error('网络请求失败，请检查您的网络连接');
      } else {
        message.error('提交表单时发生错误');
      }
      console.error('提交表单失败:', error);
    }
  };

  // 处理分页变化
  const handleTableChange = (pagination, filters, sorter) => {
    console.log('分页变化:', pagination);
    const newPage = pagination.current;
    const newPageSize = pagination.pageSize;
    
    // 记录新的页码和页面大小
    setCurrent(newPage);
    setPageSize(newPageSize);
    
    // 重新获取数据
    fetchSalesReps(newPage, newPageSize);
    
    console.log(`已切换到第 ${newPage} 页，每页 ${newPageSize} 条记录`);
  };

  // 业绩数据渲染
  const renderPerformanceData = () => {
    if (!performanceData) return null;
    
    return (
      <Card title="销售业绩" bordered={false}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic 
              title="管理许可证数量" 
              value={performanceData.TotalLicenses} 
              suffix="张" 
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="本月新增许可证" 
              value={performanceData.NewLicensesThisMonth} 
              suffix="张" 
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="总销售额" 
              value={performanceData.TotalRevenue} 
              precision={2} 
              prefix="$"
            />
          </Col>
        </Row>

        <Divider orientation="left">销售历史</Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Table 
              dataSource={performanceData.RecentSales || []}
              columns={[
                {
                  title: '许可证ID',
                  dataIndex: 'LicenseID',
                  key: 'LicenseID',
                },
                {
                  title: '客户',
                  dataIndex: 'CustomerName',
                  key: 'CustomerName',
                },
                {
                  title: '销售日期',
                  dataIndex: 'SaleDate',
                  key: 'SaleDate',
                  render: (text) => new Date(text).toLocaleDateString(),
                },
                {
                  title: '金额',
                  dataIndex: 'Amount',
                  key: 'Amount',
                  render: (text) => `$${text.toFixed(2)}`,
                },
                {
                  title: '类型',
                  dataIndex: 'SaleType',
                  key: 'SaleType',
                  render: (type) => {
                    const typeColors = {
                      NEW: 'green',
                      RENEWAL: 'blue',
                      UPGRADE: 'purple',
                      EXPANSION: 'orange',
                    };
                    return <Tag color={typeColors[type] || 'default'}>{type}</Tag>;
                  },
                },
              ]}
              pagination={false}
              size="small"
            />
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col>
          <Title level={2}>销售人员管理</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            添加销售人员
          </Button>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Form layout="inline" onFinish={handleSearch}>
          <Form.Item label="姓名">
            <Input
              placeholder="输入姓名"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              prefix={<UserOutlined />}
              allowClear
            />
          </Form.Item>
          <Form.Item label="部门">
            <Select
              placeholder="选择部门"
              value={searchDepartment}
              onChange={value => setSearchDepartment(value)}
              allowClear
              style={{ width: 160 }}
            >
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="状态">
            <Select
              placeholder="选择状态"
              value={searchStatus}
              onChange={value => setSearchStatus(value)}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="ACTIVE">在职</Option>
              <Option value="INACTIVE">离职</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={salesReps}
        rowKey="SalesRepID"
        loading={loading}
        pagination={{
          current,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total) => `共 ${total} 条数据`,
          position: ['bottomRight'],
          size: 'default'
        }}
        onChange={handleTableChange}
      />
      {/* 添加调试信息 */}
      <div style={{ marginTop: 10, color: '#999', fontSize: '12px' }}>
        当前页: {current}, 每页数量: {pageSize}, 总记录数: {total}
      </div>

      {/* 表单模态框 */}
      <Modal
        title={selectedSalesRep ? '编辑销售人员' : '添加销售人员'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            确定
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="SalesRepName"
            label="姓名"
            rules={[{ required: true, message: '请输入销售人员姓名' }]}
          >
            <Input placeholder="请输入姓名" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="Email"
            label="电子邮箱"
            rules={[
              { required: true, message: '请输入电子邮箱' },
              { type: 'email', message: '请输入有效的电子邮箱' },
            ]}
          >
            <Input placeholder="请输入电子邮箱" prefix={<MailOutlined />} />
          </Form.Item>
          <Form.Item
            name="Phone"
            label="电话"
          >
            <Input placeholder="请输入电话号码" prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item
            name="Department"
            label="部门"
          >
            <Input placeholder="请输入部门" prefix={<TeamOutlined />} />
          </Form.Item>
          <Form.Item
            name="Position"
            label="职位"
          >
            <Input placeholder="请输入职位" />
          </Form.Item>
          <Form.Item
            name="Status"
            label="状态"
            initialValue="ACTIVE"
          >
            <Select placeholder="请选择状态">
              <Option value="ACTIVE">在职</Option>
              <Option value="INACTIVE">离职</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        title="确认删除"
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            取消
          </Button>,
          <Button key="delete" type="primary" danger onClick={confirmDelete}>
            删除
          </Button>,
        ]}
      >
        <p>确定要删除销售人员 <strong>{selectedSalesRep?.SalesRepName}</strong> 吗？此操作不可撤销，且可能影响相关的许可证记录。</p>
      </Modal>

      {/* 销售业绩模态框 */}
      <Modal
        title={`${selectedSalesRep?.SalesRepName || ''} 的销售业绩`}
        visible={performanceVisible}
        onCancel={() => setPerformanceVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setPerformanceVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {performanceLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            加载中...
          </div>
        ) : (
          renderPerformanceData()
        )}
      </Modal>
    </div>
  );
};

export default SalesReps;
