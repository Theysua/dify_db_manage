import React, { useState } from 'react';
import { Card, Tabs, Button, Tooltip, Spin, Empty, Radio, Alert, message } from 'antd';
import { DownloadOutlined, FullscreenOutlined, FullscreenExitOutlined, ReloadOutlined, BarChartOutlined, LineChartOutlined, FunnelPlotOutlined } from '@ant-design/icons';
import { ResponsiveFunnel } from '@nivo/funnel';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import html2canvas from 'html2canvas';
import { useTheme } from '../../context/ThemeContext';
import { brandColors } from '../../styles/theme';
import { motion } from 'framer-motion';

/**
 * 增强的销售数据可视化组件
 * 提供多种图表类型：漏斗图、柱状图和趋势图
 * 支持深色模式、交互式部件、数据导出功能等
 * 支持按数量/价值切换所有图表类型的展示方式
 */
export const EnhancedFunnel = ({ 
  data = [], 
  isLoading = false, 
  onRefresh = null,
  title = "销售漏斗",
  height = 400,
  viewType = 'funnel' // 图表类型: funnel(漏斗图), bar(柱状图), line(趋势图)
}) => {
  // 状态管理
  const [activeView, setActiveView] = useState('count');
  const [fullscreen, setFullscreen] = useState(false);
  const { darkMode } = useTheme();
  const [exportLoading, setExportLoading] = useState(false);
  
  // 空数据或加载中处理
  if (isLoading) {
    return (
      <Card title={title}>
        <div style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card title={title}>
        <div style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Empty description="暂无数据" />
        </div>
      </Card>
    );
  }
  
  // 根据当前视图准备图表数据
  const chartData = data.map(item => ({
    ...item,
    value: activeView === 'count' ? item.count : item.totalValue,
    color: item.color || brandColors.primary, // 使用自定义颜色或默认主色
    // 计算转化率
    conversionRate: item.prevCount ? Math.round((item.count / item.prevCount) * 100) : 100
  }));
  
  // 漏斗图配置
  const funnelConfig = {
    data: chartData,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    valueFormat: activeView === 'count' 
      ? value => `${value}个` 
      : value => `¥${value.toLocaleString()}`,
    colors: { scheme: 'nivo' },  // 使用预定义配色方案避免自定义函数问题
    borderWidth: 20,
    labelColor: darkMode ? '#ffffff' : '#333333',
    motionConfig: 'gentle',
    animate: true
  };
  
  // 准备刷状图数据
  const prepareBarData = () => {
    return data.map(item => ({
      stage: item.name,
      value: activeView === 'count' ? item.count : item.totalValue,
      stageColor: item.color || brandColors.primary
    }))
  };
  
  // 柱状图配置
  const barConfig = {
    data: prepareBarData(),
    keys: ['value'],
    indexBy: 'stage',
    margin: { top: 50, right: 40, bottom: 100, left: 80 },
    padding: 0.3,
    valueScale: { type: 'linear' },
    indexScale: { type: 'band', round: true },
    colors: ({ data }) => data.stageColor || brandColors.primary,
    borderRadius: 4,
    borderColor: { from: 'color', modifiers: [['darker', 1.6]] },
    axisBottom: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: -45,
      legend: '销售阶段',
      legendPosition: 'middle',
      legendOffset: 80
    },
    axisLeft: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: activeView === 'count' ? '商机数量' : '商机价值',
      legendPosition: 'middle',
      legendOffset: -60
    },
    labelSkipWidth: 12,
    labelSkipHeight: 12,
    labelTextColor: { from: 'color', modifiers: [['darker', 1.6]] },
    legends: [
      {
        dataFrom: 'keys',
        anchor: 'top',
        direction: 'row',
        justify: false,
        translateX: 0,
        translateY: -40,
        itemsSpacing: 2,
        itemWidth: 100,
        itemHeight: 20,
        itemDirection: 'left-to-right',
        itemOpacity: 0.85,
        symbolSize: 20,
        effects: [
          {
            on: 'hover',
            style: {
              itemOpacity: 1
            }
          }
        ]
      }
    ],
    motionConfig: 'gentle',
    animate: true
  };
  
  // 准备趋势图数据
  const prepareLineData = () => {
    return [
      {
        id: activeView === 'count' ? '商机数量' : '商机价值',
        color: brandColors.primary,
        data: data.map(item => ({
          x: item.name,
          y: activeView === 'count' ? item.count : item.totalValue
        }))
      }
    ];
  };
  
  // 趋势图配置
  const lineConfig = {
    data: prepareLineData(),
    margin: { top: 50, right: 110, bottom: 80, left: 80 },
    xScale: { type: 'point' },
    yScale: {
      type: 'linear',
      min: 'auto',
      max: 'auto',
      stacked: false,
      reverse: false
    },
    yFormat: activeView === 'count' ? value => `${value}个` : value => `¥${value.toLocaleString()}`,
    axisTop: null,
    axisRight: null,
    axisBottom: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: -45,
      legend: '销售阶段',
      legendOffset: 60,
      legendPosition: 'middle'
    },
    axisLeft: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: activeView === 'count' ? '商机数量' : '商机价值',
      legendOffset: -60,
      legendPosition: 'middle'
    },
    pointSize: 10,
    pointColor: { theme: 'background' },
    pointBorderWidth: 2,
    pointBorderColor: { from: 'serieColor' },
    pointLabelYOffset: -12,
    useMesh: true,
    legends: [
      {
        anchor: 'bottom-right',
        direction: 'column',
        justify: false,
        translateX: 100,
        translateY: 0,
        itemsSpacing: 0,
        itemDirection: 'left-to-right',
        itemWidth: 80,
        itemHeight: 20,
        itemOpacity: 0.75,
        symbolSize: 12,
        symbolShape: 'circle',
        symbolBorderColor: 'rgba(0, 0, 0, .5)',
        effects: [
          {
            on: 'hover',
            style: {
              itemBackground: 'rgba(0, 0, 0, .03)',
              itemOpacity: 1
            }
          }
        ]
      }
    ]
  };
  
  // 导出图表为图片
  const exportChart = () => {
    setExportLoading(true);
    try {
      const chartElement = document.getElementById('chart-container');
      message.loading('正在导出图表...');
      
      html2canvas(chartElement).then(canvas => {
        const link = document.createElement('a');
        const chartType = viewType === 'funnel' ? '漏斗图' : viewType === 'bar' ? '柱状图' : '趋势图';
        link.download = `sales-${viewType}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        message.success(`${chartType}已成功导出为图片`);
      }).catch(err => {
        console.error('Error exporting chart:', err);
        message.error('导出图表时出错');
      }).finally(() => {
        setExportLoading(false);
      });
    } catch (err) {
      console.error('Error in export function:', err);
      message.error('导出图表时出错');
      setExportLoading(false);
    }
  };
  
  // 渲染图表组件
  const renderChart = () => {
    const baseTheme = {
      textColor: darkMode ? '#ffffff' : '#333333',
      fontSize: 12,
      axis: {
        domain: {
          line: {
            stroke: darkMode ? '#555555' : '#dddddd'
          }
        },
        ticks: {
          line: {
            stroke: darkMode ? '#555555' : '#dddddd'
          },
          text: {
            fill: darkMode ? '#ffffff' : '#333333'
          }
        },
        legend: {
          text: {
            fill: darkMode ? '#ffffff' : '#333333'
          }
        }
      },
      tooltip: {
        container: {
          background: darkMode ? '#333333' : '#ffffff',
          color: darkMode ? '#ffffff' : '#333333',
        }
      },
      grid: {
        line: {
          stroke: darkMode ? '#444444' : '#dddddd'
        }
      }
    };
    
    switch(viewType) {
      case 'bar':
        return (
          <ResponsiveBar
            {...barConfig}
            theme={baseTheme}
          />
        );
      case 'line':
        return (
          <ResponsiveLine
            {...lineConfig}
            theme={baseTheme}
          />
        );
      case 'funnel':
      default:
        return (
          <ResponsiveFunnel
            {...funnelConfig}
            theme={{
              ...baseTheme,
              tooltip: {
                container: {
                  background: 'transparent',
                  boxShadow: 'none',
                  padding: 0
                }
              }
            }}
            tooltip={CustomTooltip}
          />
        );
    }
  };
  
  // 切换全屏显示
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  
  // 确定显示尺寸
  const displayHeight = fullscreen ? '80vh' : height;
  
  // 自定义图表工具栏
  const chartToolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Radio.Group 
        value={activeView}
        onChange={e => setActiveView(e.target.value)}
        buttonStyle="solid"
        size="small"
      >
        <Radio.Button value="count">按数量</Radio.Button>
        <Radio.Button value="value">按价值</Radio.Button>
      </Radio.Group>
      
      <div style={{ display: 'flex', gap: 8 }}>
        {onRefresh && (
          <Tooltip title="刷新数据">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={onRefresh}
              size="small"
            />
          </Tooltip>
        )}
        <Tooltip title="导出图表">
          <Button 
            icon={<DownloadOutlined />} 
            onClick={exportChart}
            size="small"
            loading={exportLoading}
          />
        </Tooltip>
        <Tooltip title={fullscreen ? "退出全屏" : "全屏显示"}>
          <Button 
            icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
            onClick={toggleFullscreen}
            size="small"
          />
        </Tooltip>
      </div>
    </div>
  );

  // 自定义悬停提示
  const CustomTooltip = ({ label, value, color, formattedValue, datum }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: darkMode ? '#333' : 'white',
          color: darkMode ? 'white' : '#333',
          padding: '12px 16px',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: `1px solid ${darkMode ? '#555' : '#eee'}`,
          maxWidth: '250px',
        }}
      >
        <div style={{ 
          borderLeft: `4px solid ${color}`, 
          paddingLeft: '8px',
          marginBottom: '8px'
        }}>
          <strong style={{ fontSize: '16px' }}>{label}</strong>
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span>商机数量: </span>
          <strong>{datum.count}个</strong>
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span>总价值: </span>
          <strong>¥{datum.totalValue.toLocaleString()}</strong>
        </div>
        <div>
          <span>转化率: </span>
          <strong>{datum.conversionRate}%</strong>
        </div>
      </motion.div>
    );
  };
  
  return (
    <motion.div
      layout
      transition={{ duration: 0.3 }}
      style={{ 
        position: fullscreen ? 'fixed' : 'relative',
        top: fullscreen ? 0 : 'auto',
        left: fullscreen ? 0 : 'auto',
        right: fullscreen ? 0 : 'auto',
        bottom: fullscreen ? 0 : 'auto',
        zIndex: fullscreen ? 1000 : 'auto',
        background: darkMode ? '#121212' : 'white',
        width: fullscreen ? '100vw' : '100%'
      }}
    >
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {viewType === 'funnel' && <FunnelPlotOutlined style={{ marginRight: 8 }} />}
            {viewType === 'bar' && <BarChartOutlined style={{ marginRight: 8 }} />}
            {viewType === 'line' && <LineChartOutlined style={{ marginRight: 8 }} />}
            <span>{title}</span>
          </div>
        } 
        extra={chartToolbar}
        bordered={!fullscreen}
        bodyStyle={{ padding: fullscreen ? '24px' : '12px' }}
        style={{ 
          height: fullscreen ? '100vh' : 'auto',
          boxShadow: fullscreen ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {viewType !== 'funnel' && activeView === 'count' && data.some(item => item.count > 1000) && (
          <Alert 
            message="数字比较大，可以切换到漏斗图模式查看分布" 
            type="info" 
            showIcon 
            style={{ marginBottom: 16 }} 
            closable 
          />
        )}
        
        <motion.div 
          id="chart-container" 
          style={{ 
            height: displayHeight, 
            width: '100%'
          }}
          key={`${viewType}-${activeView}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderChart()}
        </motion.div>
      </Card>
    </motion.div>
  );
};
