import React, { useState } from 'react';
import { Card, Select, DatePicker, Button, Tooltip, Spin, Empty, Alert, message } from 'antd';
import { DownloadOutlined, ReloadOutlined, FullscreenOutlined, FullscreenExitOutlined, HeatMapOutlined, TableOutlined, PieChartOutlined } from '@ant-design/icons';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { useTheme } from '../../context/ThemeContext';
import { brandColors } from '../../styles/theme';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

/**
 * 销售热力图组件
 * 展示销售数据在不同维度的分布热度
 * 支持深色模式、全屏界面、动画效果等增强功能
 */
export const SalesHeatmap = ({
  data = [],
  isLoading = false,
  onRefresh = null,
  onFilterChange = null,
  title = "销售热力图",
  height = 450
}) => {
  // 状态管理
  const [dimension, setDimension] = useState('salesRep');
  const [dateRange, setDateRange] = useState([dayjs().subtract(3, 'month'), dayjs()]);
  const [fullscreen, setFullscreen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [viewType, setViewType] = useState('heatmap');
  const { darkMode } = useTheme();
  
  // 处理维度变更
  const handleDimensionChange = (value) => {
    setDimension(value);
    if (onFilterChange) {
      onFilterChange({ dimension: value, dateRange });
    }
  };
  
  // 处理日期范围变更
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (onFilterChange) {
      onFilterChange({ dimension, dateRange: dates });
    }
  };
  
  // 切换全屏显示
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  
  // 确定显示尺寸
  const displayHeight = fullscreen ? '80vh' : height;
  
  // 导出图表为图片
  const exportChart = () => {
    setExportLoading(true);
    try {
      const chartElement = document.getElementById('heatmap-chart');
      message.loading('正在导出热力图...');
      
      html2canvas(chartElement).then(canvas => {
        const link = document.createElement('a');
        link.download = `sales-heatmap-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        message.success('热力图已成功导出为图片');
      }).catch(err => {
        console.error('Error exporting heatmap:', err);
        message.error('导出热力图时出错');
      }).finally(() => {
        setExportLoading(false);
      });
    } catch (err) {
      console.error('Error in export function:', err);
      message.error('导出热力图时出错');
      setExportLoading(false);
    }
  };
  
  // 切换图表类型
  const handleViewTypeChange = (type) => {
    setViewType(type);
  };
  
  // 空数据或加载中处理
  if (isLoading) {
    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeatMapOutlined style={{ marginRight: 8 }} />
            {title}
          </div>
        }
      >
        <div style={{ height: displayHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HeatMapOutlined style={{ marginRight: 8 }} />
            {title}
          </div>
        }
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Select
              defaultValue="salesRep"
              value={dimension}
              onChange={handleDimensionChange}
              style={{ width: 120 }}
              options={[
                { value: 'salesRep', label: '按销售员' },
                { value: 'product', label: '按产品' },
                { value: 'region', label: '按地区' },
              ]}
            />
            <RangePicker 
              value={dateRange}
              onChange={handleDateRangeChange}
            />
            {onRefresh && (
              <Tooltip title="刷新数据">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={onRefresh}
                  size="small"
                />
              </Tooltip>
            )}
          </div>
        }
      >
        <motion.div 
          style={{ height: displayHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Empty 
            description={
              <span>
                <div>暂无数据</div>
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={onRefresh}
                  style={{ marginTop: 16 }}
                >
                  加载数据
                </Button>
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </motion.div>
      </Card>
    );
  }
  
  // 图表配置
  const heatmapConfig = {
    data,
    margin: { top: 60, right: 90, bottom: 60, left: 90 },
    valueFormat: (value) => `¥${value.toLocaleString()}`,
    axisTop: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: -45,
      legend: '',
      legendOffset: 46
    },
    axisRight: null,
    axisBottom: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: dimension === 'salesRep' ? '月份' : dimension === 'product' ? '产品' : '地区',
      legendPosition: 'middle',
      legendOffset: 36
    },
    axisLeft: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: dimension === 'salesRep' ? '销售员' : dimension === 'product' ? '月份' : '月份',
      legendPosition: 'middle',
      legendOffset: -72
    },
    colors: {
      type: 'sequential',
      scheme: 'purples',
      minValue: 0,
      maxValue: 'auto'
    },
    emptyColor: darkMode ? '#444' : '#f5f5f5',
    borderWidth: 1,
    borderColor: darkMode ? '#555' : '#ddd',
    enableLabels: true,
    labelTextColor: { from: 'color', modifiers: [ [ 'darker', 3 ] ] },
    legends: [
      {
        anchor: 'bottom',
        translateX: 0,
        translateY: 30,
        length: 400,
        thickness: 12,
        direction: 'row',
        tickPosition: 'after',
        tickSize: 3,
        tickSpacing: 4,
        tickOverlap: false,
        tickFormat: value => `¥${value.toLocaleString()}`,
        title: '销售额（元）',
        titleAlign: 'start',
        titleOffset: 4
      }
    ],
    animate: true,
    motionConfig: 'gentle',
    hoverTarget: 'cell',
    cellHoverOthersOpacity: 0.25,
    cellOpacity: 0.85,
    cellHoverOpacity: 1,
    tooltip: ({ xKey, yKey, value, color, cell }) => (
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
          <strong style={{ fontSize: '16px' }}>{dimension === 'salesRep' ? '销售员' : dimension === 'product' ? '产品' : '地区'}: {yKey}</strong>
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span>月份: </span>
          <strong>{xKey}</strong>
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span>销售额: </span>
          <strong style={{ color: brandColors.success }}>¥{value.toLocaleString()}</strong>
        </div>
        {cell.data.percentage && (
          <div>
            <span>同比增长: </span>
            <strong style={{ color: cell.data.percentage > 0 ? brandColors.success : brandColors.error }}>
              {cell.data.percentage > 0 ? '+' : ''}{cell.data.percentage}%
            </strong>
          </div>
        )}
      </motion.div>
    )
  };
  
  // 图表工具栏
  const chartToolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Select
        value={dimension}
        onChange={handleDimensionChange}
        style={{ width: 120 }}
        options={[
          { value: 'salesRep', label: '按销售员' },
          { value: 'product', label: '按产品' },
          { value: 'region', label: '按地区' },
        ]}
      />
      <RangePicker 
        value={dateRange}
        onChange={handleDateRangeChange}
        allowClear={false}
      />
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
            <HeatMapOutlined style={{ marginRight: 8 }} />
            {title}
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
        <motion.div 
          id="heatmap-chart" 
          key={`heatmap-${dimension}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ 
            height: displayHeight, 
            width: '100%',
            position: 'relative'
          }}
        >
          <Alert
            message={`数据时间范围: ${dateRange[0].format('YYYY-MM-DD')} 至 ${dateRange[1].format('YYYY-MM-DD')}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" type="link" onClick={onRefresh}>更新</Button>
            }
          />
          
          <ResponsiveHeatMap
            {...heatmapConfig}
            theme={{
              textColor: darkMode ? '#ffffff' : '#333333',
              tooltip: {
                container: {
                  background: 'transparent',
                  boxShadow: 'none',
                  padding: 0
                }
              },
              grid: {
                line: {
                  stroke: darkMode ? '#444' : '#ddd',
                }
              },
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
              }
            }}
          />
        </motion.div>
      </Card>
    </motion.div>
  );
};
