import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Link
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  EventNote as EventNoteIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { partnerOrders, partnerAuth } from '../../services/partnerApi';

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'error';
    case 'COMPLETED':
      return 'info';
    default:
      return 'default';
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('zh-CN');
};

const PartnerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const partnerInfo = partnerAuth.getPartnerInfo();
  
  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await partnerOrders.getOrders();
        setOrders(data);
      } catch (err) {
        setError('加载订单数据失败，请稍后重试');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Calculate dashboard statistics
  const calculateStats = () => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        approvedOrders: 0,
        rejectedOrders: 0,
        totalAmount: 0
      };
    }
    
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.Status === 'PENDING').length,
      approvedOrders: orders.filter(o => ['APPROVED', 'COMPLETED'].includes(o.Status)).length,
      rejectedOrders: orders.filter(o => o.Status === 'REJECTED').length,
      totalAmount: orders.reduce((sum, order) => sum + order.TotalAmount, 0)
    };
  };
  
  const stats = calculateStats();
  
  // Get recent orders (latest 5)
  const recentOrders = orders.slice(0, 5);
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">合作伙伴控制面板</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/partner/orders/new"
        >
          创建新订单
        </Button>
      </Box>
      
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.dark' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">订单总数</Typography>
              </Box>
              <Typography variant="h4">{stats.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventNoteIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">待审核</Typography>
              </Box>
              <Typography variant="h4">{stats.pendingOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventNoteIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">已批准</Typography>
              </Box>
              <Typography variant="h4">{stats.approvedOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">订单总额</Typography>
              </Box>
              <Typography variant="h4">¥{stats.totalAmount.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">最近订单</Typography>
          <Button 
            component={RouterLink} 
            to="/partner/orders" 
            variant="outlined" 
            size="small"
          >
            查看全部
          </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {recentOrders.length === 0 ? (
          <Typography variant="body1" align="center" sx={{ py: 3 }}>
            暂无订单记录
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>订单编号</TableCell>
                  <TableCell>日期</TableCell>
                  <TableCell align="right">金额</TableCell>
                  <TableCell align="center">状态</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.OrderId}>
                    <TableCell>{order.OrderNumber}</TableCell>
                    <TableCell>{formatDate(order.OrderDate)}</TableCell>
                    <TableCell align="right">¥{order.TotalAmount.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={order.Status} 
                        color={getStatusColor(order.Status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/partner/orders/${order.OrderId}`}
                        size="small"
                      >
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>合作伙伴信息</Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">公司名称</Typography>
            <Typography variant="body1" gutterBottom>{partnerInfo?.PartnerName || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">联系人</Typography>
            <Typography variant="body1" gutterBottom>{partnerInfo?.ContactPerson || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">合作级别</Typography>
            <Typography variant="body1" gutterBottom>{partnerInfo?.PartnerLevel || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">地区</Typography>
            <Typography variant="body1" gutterBottom>{partnerInfo?.Region || 'N/A'}</Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Button 
            component={RouterLink} 
            to="/partner/profile" 
            variant="outlined" 
            size="small"
          >
            更新资料
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PartnerDashboard;
