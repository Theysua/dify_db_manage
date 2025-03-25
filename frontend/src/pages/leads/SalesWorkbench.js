import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Typography, Table, Button, 
  Tabs, Tag, Timeline, Empty, Spin, Modal
} from 'antd';
import {
  PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  PhoneOutlined, MailOutlined, UserOutlined, TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { getLeads, getLeadFunnelData } from '../../services/leadService';
import { getAllSalesReps } from '../../services/salesRepService';
import useAuth from '../../hooks/useAuth';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SalesWorkbench = () => {
  const [loading, setLoading] = useState(true);
  const [salesRepLoading, setSalesRepLoading] = useState(true);
  // 所有商机数据，可在控制台查看或供未来功能扩展
  const [, setLeads] = useState([]);
  const [myLeads, setMyLeads] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  // 销售代表数据，可在控制台查看或供未来功能扩展
  const [, setSalesReps] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    negotiating: 0,
    won: 0,
    lost: 0,
    totalValue: 0
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  // 使用useCallback包装函数，避免循环引用
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      // 获取所有商机
      const response = await getLeads({ limit: 1000 });
      const allLeads = response.data;
      setLeads(allLeads);

      // 设置最近添加的商机
      const sorted = [...allLeads].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentLeads(sorted.slice(0, 5));

      // 如果用户是销售代表，过滤出他们的商机
      if (user?.role === 'sales_rep' && user?.sales_rep_id) {
        const filteredLeads = allLeads.filter(
          lead => lead.sales_rep && lead.sales_rep.sales_rep_id === user?.sales_rep_id
        );
        setMyLeads(filteredLeads);
      }



      // 计算基本统计数据
      const negotiating = allLeads.filter(lead => 
        lead.status.status_name === '洽谈中' || lead.status.status_name === '已提交方案'
      ).length;
      const won = allLeads.filter(lead => lead.status.status_name === '已赢单').length;
      const lost = allLeads.filter(lead => lead.status.status_name === '已输单').length;
      const totalValue = allLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);

      setStats({
        total: allLeads.length,
        negotiating,
        won,
        lost,
        totalValue
      });
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchSalesReps = useCallback(async () => {
    try {
      setSalesRepLoading(true);
      const response = await getAllSalesReps();
      setSalesReps(response.data);
    } catch (error) {
      console.error('Failed to fetch sales reps:', error);
    } finally {
      setSalesRepLoading(false);
    }
  }, []);

  const fetchFunnelData = useCallback(async () => {
    try {
      // 这里可以获取漏斗数据，如果需要展示在工作台上
    } catch (error) {
      console.error('Failed to fetch funnel data:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchSalesReps();
    fetchFunnelData();
  }, [fetchLeads, fetchSalesReps, fetchFunnelData]);







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

  // 最近商机表格列
  const recentLeadsColumns = [
    {
      title: '商机名称',
      dataIndex: 'lead_name',
      key: 'lead_name',
      render: (text, record) => (
        <a href={`/leads/${record.lead_id}`} onClick={(e) => { e.preventDefault(); navigate(`/leads/${record.lead_id}`); }}>{text}</a>
      ),
    },
    {
      title: '公司',
      dataIndex: 'company_name',
      key: 'company_name',
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
      title: '添加时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => navigate(`/leads/${record.lead_id}`)}
        >
          查看
        </Button>
      ),
    },
  ];



  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Title level={4}>销售工作台</Title>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="全部商机"
              value={stats.total}
              prefix={<TeamOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="洽谈中/已提方案"
              value={stats.negotiating}
              prefix={<ClockCircleOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已赢单"
              value={stats.won}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="商机总价值"
              value={stats.totalValue}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="recent">
        <TabPane tab="最近添加的商机" key="recent">
          <Card bordered={false}>
            <Table
              columns={recentLeadsColumns}
              dataSource={recentLeads}
              rowKey="lead_id"
              pagination={false}
            />
          </Card>
        </TabPane>



        {user?.role === 'sales_rep' && (
          <TabPane tab="我的商机" key="my-leads">
            <Card bordered={false}>
              {myLeads.length > 0 ? (
                <Table
                  columns={recentLeadsColumns}
                  dataSource={myLeads}
                  rowKey="lead_id"
                />
              ) : (
                <Empty description="暂无分配给您的商机" />
              )}
            </Card>
          </TabPane>
        )}


      </Tabs>
    </div>
  );
};

export default SalesWorkbench;
