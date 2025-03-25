import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Empty, Statistic, Typography } from 'antd';
import { FunnelChart, Funnel, Tooltip, LabelList } from 'recharts';
import { getLeadFunnelData } from '../../services/leadService';

const { Title, Text } = Typography;

const LeadFunnel = () => {
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      const response = await getLeadFunnelData();
      setFunnelData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch funnel data:', err);
      setError('获取漏斗数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 为漏斗图准备数据，并添加颜色
  const prepareFunnelData = () => {
    if (!funnelData || !funnelData.stages || funnelData.stages.length === 0) {
      return [];
    }

    // 定义漏斗各阶段颜色
    const colors = ['#1890ff', '#36cbcb', '#4ecb73', '#fbd437', '#f2637b', '#975fe4'];
    
    return funnelData.stages.map((stage, index) => ({
      name: stage.status_name,
      value: stage.count,
      fill: colors[index % colors.length],
      totalValue: stage.total_value,
    }));
  };

  // 自定义漏斗图的标签内容
  const renderCustomizedLabel = (props) => {
    const { x, y, width, value, name, totalValue } = props;
    return (
      <g>
        <text x={x + width / 2} y={y - 10} fill="#000" textAnchor="middle" dominantBaseline="middle">
          {name}
        </text>
        <text x={x + width / 2} y={y + 20} fill="#666" textAnchor="middle" dominantBaseline="middle">
          {`${value} 个商机`}
        </text>
        <text x={x + width / 2} y={y + 40} fill="#666" textAnchor="middle" dominantBaseline="middle">
          {`￥${totalValue.toLocaleString()}`}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card bordered={false} style={{ background: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          <p><strong>{data.name}</strong></p>
          <p>商机数量: {data.value}</p>
          <p>总价值: ￥{data.totalValue.toLocaleString()}</p>
        </Card>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Empty description={error} />
      </div>
    );
  }

  const data = prepareFunnelData();

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Empty description="暂无商机数据" />
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Title level={4} style={{ textAlign: 'center' }}>销售漏斗概览</Title>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 20 }}>
            各阶段商机数量和预估价值分布
          </Text>
        </Col>
      </Row>

      <Row gutter={[16, 24]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总商机数"
              value={funnelData.total_leads}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总预估价值"
              value={funnelData.total_value}
              precision={2}
              prefix="￥"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="平均单个商机价值"
              value={funnelData.total_leads > 0 ? (funnelData.total_value / funnelData.total_leads) : 0}
              precision={2}
              prefix="￥"
            />
          </Card>
        </Col>
      </Row>

      <div style={{ width: '100%', height: 400, marginTop: 30 }}>
        <FunnelChart width={700} height={400} data={data}>
          <Tooltip content={<CustomTooltip />} />
          <Funnel
            dataKey="value"
            nameKey="name"
            data={data}
            isAnimationActive
          >
            <LabelList
              position="right"
              content={renderCustomizedLabel}
            />
          </Funnel>
        </FunnelChart>
      </div>
    </div>
  );
};

export default LeadFunnel;
