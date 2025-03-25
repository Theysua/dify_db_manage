import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { partnerOrders } from '../../services/partnerApi';

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

// Helper function to get status text in Chinese
const getStatusText = (status) => {
  switch (status) {
    case 'APPROVED':
      return '已批准';
    case 'PENDING':
      return '审核中';
    case 'REJECTED':
      return '已拒绝';
    case 'COMPLETED':
      return '已完成';
    default:
      return status;
  }
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch order details on component mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const data = await partnerOrders.getOrderDetails(orderId);
        setOrder(data);
      } catch (err) {
        setError('加载订单详情失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Error state
  if (error || !order) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        {error || '订单不存在或已被删除'}
        <Button 
          sx={{ ml: 2 }} 
          size="small" 
          onClick={() => navigate('/partner/orders')}
        >
          返回订单列表
        </Button>
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">订单详情</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/partner/orders')}
        >
          返回订单列表
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">订单编号</Typography>
            <Typography variant="h6" gutterBottom>{order.OrderNumber}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">订单状态</Typography>
            <Chip 
              label={getStatusText(order.Status)} 
              color={getStatusColor(order.Status)}
              sx={{ mt: 0.5 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">下单日期</Typography>
            <Typography variant="body1" gutterBottom>{formatDate(order.OrderDate)}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">总金额</Typography>
            <Typography variant="h6" gutterBottom>¥{order.TotalAmount.toLocaleString()}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              协议确认
            </Typography>
            <Typography variant="body2">
              协议确认状态: {order.AgreementAcknowledged ? '已确认' : '未确认'}
            </Typography>
            {order.AgreementDate && (
              <Typography variant="body2">
                确认时间: {new Date(order.AgreementDate).toLocaleString('zh-CN')}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              订单项目
            </Typography>
          </Grid>
        </Grid>
        
        {order.OrderItems && order.OrderItems.map((item, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 2, mt: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    {index + 1}. {item.ProductName} - {item.LicenseType}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">最终用户</Typography>
                  <Typography variant="body2">{item.EndUserName}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">授权数量</Typography>
                  <Typography variant="body2">{item.Quantity}套</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">授权年限</Typography>
                  <Typography variant="body2">{item.LicenseDurationYears}年</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">单价</Typography>
                  <Typography variant="body2">¥{item.UnitPrice.toLocaleString()}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">税率</Typography>
                  <Typography variant="body2">{(item.TaxRate * 100).toFixed(1)}%</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">总价(含税)</Typography>
                  <Typography variant="body2" fontWeight="bold">¥{item.TotalPrice.toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">备注</Typography>
          <Typography variant="body2">{order.Notes || '无'}</Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            创建时间: {new Date(order.CreatedAt).toLocaleString('zh-CN')}
          </Typography>
          <Typography variant="h6">
            订单总金额: ¥{order.TotalAmount.toLocaleString()}
          </Typography>
        </Box>
      </Paper>
      
      {order.Status === 'PENDING' && (
        <Paper sx={{ p: 3, bgcolor: 'info.light' }}>
          <Typography variant="body1">
            您的订单正在审核中，我们的团队将尽快处理。如有紧急需求，请直接联系您的客户经理。
          </Typography>
        </Paper>
      )}
      
      {order.Status === 'REJECTED' && (
        <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
          <Typography variant="body1">
            很遗憾，您的订单未能通过审核。请联系您的客户经理了解详情，或修改后重新提交。
          </Typography>
        </Paper>
      )}
      
      {order.Status === 'APPROVED' && (
        <Paper sx={{ p: 3, bgcolor: 'success.light' }}>
          <Typography variant="body1">
            恭喜！您的订单已获批准。我们的团队将与您联系，安排后续的授权交付事宜。
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default OrderDetails;
