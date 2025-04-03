import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Tabs, DatePicker, Button, Skeleton, Tooltip, Segmented, Space, Tag, Empty, Divider, Radio, message, Alert } from 'antd';
import { 
  TrophyOutlined, 
  RiseOutlined, 
  DollarOutlined, 
  TeamOutlined,
  SyncOutlined,
  DownloadOutlined,
  FilterOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { getLeadFunnelData, getLeadPerformanceData } from '../../services/leadService';
import { useTheme } from '../../context/ThemeContext';
import { PageTransition } from '../../components/common/Transitions';
import { ContentContainer, ResponsiveCardGrid } from '../../components/common/ResponsiveLayout';
import { EnhancedFunnel } from '../../components/charts/EnhancedFunnel';
import { SalesHeatmap } from '../../components/charts/SalesHeatmap';
import { brandColors, darkModeColors } from '../../styles/theme';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

/**
 * 增强销售漏斗页面组件
 * 支持深色模式、响应式布局和改进的数据可视化
 */
const LeadFunnel = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [funnelData, setFunnelData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('funnel');
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [viewType, setViewType] = useState('funnel');
  const { darkMode } = useTheme();
  
  // 卡片悬停状态
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // 初始数据加载
  useEffect(() => {
    fetchFunnelData();
    fetchPerformanceData();
  }, []);
  
  // 当日期范围变化时重新加载数据
  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      fetchFunnelData();
      fetchPerformanceData();
    }
  }, [dateRange]);

  // 获取漏斗数据
  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      // 如果是刷新操作，则设置刷新状态
      if (!funnelData) setLoading(true);
      else setRefreshing(true);
      
      // 这里可以添加日期参数，实际项目中应该传给后端
      // const startDate = dateRange[0].format('YYYY-MM-DD');
      // const endDate = dateRange[1].format('YYYY-MM-DD');
      const response = await getLeadFunnelData();
      setFunnelData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch funnel data:', err);
      setError('获取漏斗数据失败，请稍后重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // 获取销售业绩数据
  const fetchPerformanceData = async () => {
    try {
      // 如果是刷新操作，则设置刷新状态
      if (!performanceData) setLoading(true);
      else setRefreshing(true);
      
      // 这里可以添加日期参数，实际项目中应该传给后端
      // const startDate = dateRange[0].format('YYYY-MM-DD');
      // const endDate = dateRange[1].format('YYYY-MM-DD');
      const response = await getLeadPerformanceData();
      setPerformanceData(response?.data || []);
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 准备漏斗图数据
  const prepareFunnelData = () => {
    if (!funnelData || !funnelData.stages || funnelData.stages.length === 0) {
      return [];
    }

    // 定义渐变色系
    const colors = [
      brandColors.primary,
      '#5E7EF2',
      '#6E8EF2',
      '#7E9EF2',
      '#8EAEF2',
      '#9EBEF2'
    ];
    
    return funnelData.stages.map((stage, index) => {
      // 计算前一阶段的商机数，用于计算转化率
      const prevCount = index > 0 ? funnelData.stages[index - 1].count : null;
      
      return {
        id: stage.status_name,
        name: stage.status_name,
        count: stage.count,
        value: stage.count,
        totalValue: stage.total_value,
        color: colors[index % colors.length],
        prevCount,
      };
    });
  };
  
  // 准备热力图数据
  const prepareHeatmapData = () => {
    // 检查performanceData是否存在且是一个数组
    if (!performanceData || !Array.isArray(performanceData)) {
      console.warn('Performance data is not in expected format:', performanceData);
      return [];
    }
    
    // 检查数组中的每个对象是否有效，移除无效数据
    const validData = performanceData.filter(item => item && typeof item === 'object');
    
    // 返回处理后的数据，确保总是返回一个数组
    return validData;
  };

  // 刷新所有数据
  const refreshAllData = () => {
    fetchFunnelData();
    fetchPerformanceData();
  };
  
  // 日期范围变化处理
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };
  
  // 导出数据
  const handleExportData = () => {
    message.success('数据导出功能正在开发中');
  };
  
  // 切换图表类型
  const handleViewTypeChange = (type) => {
    setViewType(type);
  };

  // 渲染筛选和工具栏
  const renderToolbar = () => {
    return (
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24} md={14}>
          <Space size={16} wrap>
            <RangePicker 
              value={dateRange} 
              onChange={handleDateRangeChange} 
              allowClear={false}
              placeholder={['开始日期', '结束日期']}
              style={{ width: 280 }}
            />
            <Tooltip title="刷新数据">
              <Button 
                icon={<SyncOutlined spin={refreshing} />} 
                onClick={refreshAllData}
                loading={refreshing}
                type="primary"
                ghost
              >
                刷新
              </Button>
            </Tooltip>
            <Tooltip title="导出数据">
              <Button icon={<DownloadOutlined />} onClick={handleExportData}>导出</Button>
            </Tooltip>
          </Space>
        </Col>
        <Col xs={24} md={10} style={{ textAlign: 'right' }}>
          <Space size={16} wrap>
            <Segmented 
              value={viewType}
              onChange={handleViewTypeChange}
              options={[
                {
                  value: 'funnel',
                  icon: <PieChartOutlined />,
                  label: '漏斗图'
                },
                {
                  value: 'bar',
                  icon: <BarChartOutlined />,
                  label: '柱状图'
                },
                {
                  value: 'line',
                  icon: <LineChartOutlined />,
                  label: '趋势图'
                },
              ]}
            />
          </Space>
        </Col>
      </Row>
    );
  };
  
  // 渲染统计卡片
  const renderStatCards = () => {
    if (!funnelData) {
      return (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} sm={12} md={12} lg={6} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    
    const cards = [
      {
        title: "总商机数",
        value: funnelData.total_leads,
        suffix: "个",
        icon: <TeamOutlined style={{ color: brandColors.primary }} />,
        precision: 0
      },
      {
        title: "总预估价值",
        value: funnelData.total_value,
        prefix: "￥",
        icon: <DollarOutlined style={{ color: brandColors.success }} />,
        precision: 2
      },
      {
        title: "平均商机价值",
        value: funnelData.total_leads > 0 ? (funnelData.total_value / funnelData.total_leads) : 0,
        prefix: "￥",
        icon: <TrophyOutlined style={{ color: brandColors.warning }} />,
        precision: 2
      },
      {
        title: "月环比增长",
        value: funnelData.growth_rate || 5.2,
        suffix: "%",
        icon: <RiseOutlined style={{ color: brandColors.info }} />,
        precision: 1
      }
    ];

    return (
      <Row gutter={[16, 16]}>
        {cards.map((card, index) => {
          const isHovered = hoveredCard === index;
          
          return (
            <Col xs={24} sm={12} md={12} lg={6} key={index}>
              <motion.div
                whileHover={{ y: -5 }}
                whileTap={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Card 
                  hoverable
                  style={{ 
                    borderTop: `3px solid ${card.icon.props.style.color}`,
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                    boxShadow: isHovered
                      ? darkMode
                        ? darkModeColors.shadow.md
                        : '0 6px 16px -8px rgba(0, 0, 0, 0.2)'
                      : 'none',
                  }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Statistic
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <motion.div
                          animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {card.icon}
                        </motion.div>
                        <span>{card.title}</span>
                      </div>
                    }
                    value={card.value}
                    precision={card.precision}
                    prefix={card.prefix}
                    suffix={card.suffix}
                    valueStyle={{ 
                      color: darkMode ? darkModeColors.text.primary : '#000',
                      fontSize: isHovered ? '28px' : '24px',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </Card>
              </motion.div>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <PageTransition>
      <ContentContainer>
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3}>
                <Space>
                  <CalendarOutlined />
                  销售漏斗分析
                  {!loading && funnelData && (
                    <Tag color={brandColors.primary}>
                      {dateRange[0].format('YYYY-MM-DD')} 至 {dateRange[1].format('YYYY-MM-DD')}
                    </Tag>
                  )}
                </Space>
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                实时跟踪销售流程中各阶段的商机转化情况和业绩表现
              </Paragraph>
            </Col>
          </Row>
        </div>

        {/* 工具栏部分 */}
        {renderToolbar()}
        
        {/* 摘要统计卡片 */}
        {renderStatCards()}
        
        <Divider style={{ margin: '24px 0' }} />
        
        {/* 标签页内容 */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginTop: 16 }}
          type="card"
          size="large"
          tabBarExtraContent={
            <Tooltip title="过滤条件">
              <Button icon={<FilterOutlined />} />
            </Tooltip>
          }
        >
          <TabPane tab="漏斗分析" key="funnel">
            <motion.div
              key={"funnel-tab"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  {loading && !funnelData ? (
                    <Card>
                      <Skeleton active paragraph={{ rows: 15 }} />
                    </Card>
                  ) : error ? (
                    <Card>
                      <Empty
                        description={
                          <span style={{ color: brandColors.error }}>
                            {error}
                          </span>
                        }
                      />
                    </Card>
                  ) : (
                    <Card title="销售漏斗">
                      <div style={{ height: 450, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <Alert 
                          message="图表组件临时无法显示" 
                          description="我们正在修复数据问题，请稍后再试。" 
                          type="warning" 
                          showIcon
                          style={{ marginBottom: 16, width: '80%' }}
                        />
                        <Button 
                          type="primary" 
                          onClick={refreshAllData}
                          loading={refreshing}
                          icon={<SyncOutlined spin={refreshing} />}
                        >
                          刷新数据
                        </Button>
                      </div>
                    </Card>
                  )}
                  {/* 以下组件临时注释掉防止错误
                  <EnhancedFunnel 
                    data={prepareFunnelData()}
                    isLoading={loading || refreshing}
                    onRefresh={refreshAllData}
                    title="销售漏斗"
                    height={450}
                    viewType={viewType}
                  />
                  */}
                </Col>
              </Row>
            </motion.div>
          </TabPane>
          
          <TabPane tab="业绩热图" key="heatmap">
            <motion.div
              key={"heatmap-tab"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  {loading && !performanceData ? (
                    <Card>
                      <Skeleton active paragraph={{ rows: 15 }} />
                    </Card>
                  ) : (
                    <Card title="销售业绩热力图">
                      <div style={{ height: 450, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <Alert 
                          message="图表组件临时无法显示" 
                          description="我们正在修复数据问题，请稍后再试。" 
                          type="warning" 
                          showIcon
                          style={{ marginBottom: 16, width: '80%' }}
                        />
                        <Button 
                          type="primary" 
                          onClick={refreshAllData}
                          loading={refreshing}
                          icon={<SyncOutlined spin={refreshing} />}
                        >
                          刷新数据
                        </Button>
                      </div>
                    </Card>
                  )}
                  {/* 以下组件临时注释掉防止错误
                  <SalesHeatmap 
                    data={prepareHeatmapData()}
                    isLoading={loading || refreshing}
                    onRefresh={refreshAllData}
                    title="销售业绩热力图"
                  />
                  */}
                </Col>
              </Row>
            </motion.div>
          </TabPane>
        </Tabs>
      </ContentContainer>
    </PageTransition>
  );
};

export default LeadFunnel;
