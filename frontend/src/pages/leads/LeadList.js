import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Space, Tag, Select, Card, 
  Row, Col, Typography, message, Tooltip, Modal, Drawer 
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, EditOutlined, 
  EyeOutlined, DeleteOutlined, ReloadOutlined,
  FunnelPlotOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getLeads, deleteLead, getLeadStatuses, getLeadSources } from '../../services/leadService';
import { getAllSalesReps } from '../../services/salesRepService';
import { getAllPartners } from '../../services/partnerService';
import LeadForm from './LeadForm';
import LeadFunnel from './LeadFunnel';
import useAuth from '../../hooks/useAuth';

const { Title } = Typography;
const { Option } = Select;

const LeadList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [sources, setSources] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [partners, setPartners] = useState([]);
  const [filters, setFilters] = useState({
    status_id: undefined,
    sales_rep_id: undefined,
    partner_id: undefined,
    source_id: undefined,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [formVisible, setFormVisible] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [funnelVisible, setFunnelVisible] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // 初始化数据
  useEffect(() => {
    fetchLeads();
    fetchLeadStatuses();
    fetchLeadSources();
    fetchSalesReps();
    fetchPartners();
  }, []);

  // 当筛选条件变化时获取数据
  useEffect(() => {
    fetchLeads();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        skip: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
        search: searchText || undefined,
        ...filters
      };
      
      const response = await getLeads(params);
      setLeads(response.data);
      setPagination({
        ...pagination,
        total: response.headers['x-total-count'] || response.data.length,
      });
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      message.error('获取商机列表失败');
    } finally {
      setLoading(false);
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

  const fetchLeadSources = async () => {
    try {
      const response = await getLeadSources();
      setSources(response.data);
    } catch (error) {
      console.error('Failed to fetch lead sources:', error);
    }
  };

  const fetchSalesReps = async () => {
    try {
      const response = await getAllSalesReps();
      setSalesReps(response.data);
    } catch (error) {
      console.error('Failed to fetch sales reps:', error);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await getAllPartners();
      setPartners(response.data);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    }
  };

  const handleSearch = () => {
    setPagination({
      ...pagination,
      current: 1,
    });
    fetchLeads();
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleAddLead = () => {
    setEditingLead(null);
    setFormVisible(true);
  };

  const handleEditLead = (record) => {
    setEditingLead(record);
    setFormVisible(true);
  };

  const handleViewLead = (id) => {
    navigate(`/leads/${id}`);
  };

  const handleDeleteLead = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个商机吗？此操作不可逆。',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteLead(id);
          message.success('商机删除成功');
          fetchLeads();
        } catch (error) {
          console.error('Failed to delete lead:', error);
          message.error('删除商机失败');
        }
      },
    });
  };

  const handleFormClose = (refresh = false) => {
    setFormVisible(false);
    setEditingLead(null);
    if (refresh) {
      fetchLeads();
    }
  };

  const handleShowFunnel = () => {
    setFunnelVisible(true);
  };

  const handleFunnelClose = () => {
    setFunnelVisible(false);
  };

  const columns = [
    {
      title: '商机名称',
      dataIndex: 'lead_name',
      key: 'lead_name',
      render: (text, record) => (
        <a onClick={() => handleViewLead(record.lead_id)}>{text}</a>
      ),
    },
    {
      title: '公司',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: '联系人',
      dataIndex: 'contact_person',
      key: 'contact_person',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status.status_name)}>
          {status.status_name}
        </Tag>
      ),
    },
    {
      title: '预估价值',
      dataIndex: 'estimated_value',
      key: 'estimated_value',
      render: (value, record) => (
        value ? `${value.toLocaleString()} ${record.currency}` : '-'
      ),
    },
    {
      title: '销售代表',
      dataIndex: 'sales_rep',
      key: 'sales_rep',
      render: (salesRep) => (
        salesRep ? salesRep.sales_rep_name : '-'
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source) => (
        source ? source.source_name : '-'
      ),
    },
    {
      title: '预计成单日期',
      dataIndex: 'expected_close_date',
      key: 'expected_close_date',
      render: (date) => (
        date ? new Date(date).toLocaleDateString() : '-'
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewLead(record.lead_id)} 
            />
          </Tooltip>
          {(user?.role === 'admin' || user?.role === 'sales_rep') && (
            <Tooltip title="编辑">
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEditLead(record)} 
              />
            </Tooltip>
          )}
          {user?.role === 'admin' && (
            <Tooltip title="删除">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => handleDeleteLead(record.lead_id)} 
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

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

  return (
    <div className="page-container">
      <Card bordered={false}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4}>商机管理</Title>
          </Col>
          <Col>
            <Space>
              {(user?.role === 'admin' || user?.role === 'sales_rep') && (
                <Button 
                  type="primary" 
                  icon={<FunnelPlotOutlined />} 
                  onClick={handleShowFunnel}
                >
                  销售漏斗
                </Button>
              )}
              {(user?.role === 'admin' || user?.role === 'sales_rep' || user?.role === 'partner') && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddLead}
                >
                  新增商机
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={5}>
            <Input
              placeholder="搜索商机名称/公司/联系人"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: 'pointer' }} />}
            />
          </Col>
          <Col span={3}>
            <Select
              placeholder="商机状态"
              style={{ width: '100%' }}
              allowClear
              value={filters.status_id}
              onChange={(value) => handleFilterChange('status_id', value)}
            >
              {statuses.map((status) => (
                <Option key={status.status_id} value={status.status_id}>
                  {status.status_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="销售代表"
              style={{ width: '100%' }}
              allowClear
              value={filters.sales_rep_id}
              onChange={(value) => handleFilterChange('sales_rep_id', value)}
            >
              {salesReps.map((rep) => (
                <Option key={rep.sales_rep_id} value={rep.sales_rep_id}>
                  {rep.sales_rep_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="合作伙伴"
              style={{ width: '100%' }}
              allowClear
              value={filters.partner_id}
              onChange={(value) => handleFilterChange('partner_id', value)}
              disabled={user?.role === 'partner'} // 合作伙伴角色不能更改此筛选项
            >
              {partners.map((partner) => (
                <Option key={partner.partner_id} value={partner.partner_id}>
                  {partner.partner_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="商机来源"
              style={{ width: '100%' }}
              allowClear
              value={filters.source_id}
              onChange={(value) => handleFilterChange('source_id', value)}
            >
              {sources.map((source) => (
                <Option key={source.source_id} value={source.source_id}>
                  {source.source_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={2}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText('');
                setFilters({
                  status_id: undefined,
                  sales_rep_id: undefined,
                  partner_id: undefined,
                  source_id: undefined,
                });
                setPagination({
                  ...pagination,
                  current: 1,
                });
              }}
            >
              重置
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={leads}
          rowKey="lead_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Drawer
        title={editingLead ? "编辑商机" : "新增商机"}
        width={720}
        onClose={() => handleFormClose()}
        visible={formVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <LeadForm
          lead={editingLead}
          statuses={statuses}
          sources={sources}
          salesReps={salesReps}
          partners={partners}
          onSuccess={() => handleFormClose(true)}
          onCancel={() => handleFormClose()}
        />
      </Drawer>

      <Drawer
        title="销售漏斗视图"
        width={800}
        onClose={handleFunnelClose}
        visible={funnelVisible}
      >
        <LeadFunnel />
      </Drawer>
    </div>
  );
};

export default LeadList;
