import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Container,
  Link
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order details from navigation state
  const { orderId, orderNumber } = location.state || {};
  
  if (!orderId || !orderNumber) {
    // Redirect to orders page if no order info is provided
    setTimeout(() => {
      navigate('/partner/orders');
    }, 3000);
    
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            无法加载订单信息
          </Typography>
          <Typography variant="body1">
            正在重定向到订单历史页面...
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 64,
              height: 64,
              mb: 2
            }}
          >
            <CheckIcon sx={{ fontSize: 40 }} />
          </Box>
        </Box>
        
        <Typography variant="h4" color="primary" gutterBottom>
          订单提交成功！
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          您的Dify.AI企业版授权订单已成功提交，我们的团队将尽快进行审核。
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'left', mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            订单信息:
          </Typography>
          <Typography variant="body1">
            <strong>订单编号:</strong> {orderNumber}
          </Typography>
          <Typography variant="body1">
            <strong>订单ID:</strong> {orderId}
          </Typography>
          <Typography variant="body1">
            <strong>提交时间:</strong> {new Date().toLocaleString('zh-CN')}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          订单状态变更会通过邮件通知您，您也可以随时在"订单历史"中查看最新状态。
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/partner/orders/${orderId}`)}
          >
            查看订单详情
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/partner/orders')}
          >
            返回订单历史
          </Button>
        </Box>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            如有任何问题，请联系我们的客户服务
          </Typography>
          <Link href="mailto:support@dify.ai" color="primary">
            support@dify.ai
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccess;
