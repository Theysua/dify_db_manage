import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  MenuItem,
  InputAdornment,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { partnerOrders, partnerAuth } from '../../services/partnerApi';

// License types available for ordering
const LICENSE_TYPES = [
  { value: '标准版', label: 'Dify.AI企业版 - 标准版' },
  { value: '高级版', label: 'Dify.AI企业版 - 高级版' },
  { value: '旗舰版', label: 'Dify.AI企业版 - 旗舰版' }
];

// License duration options in years
const DURATION_OPTIONS = [
  { value: 1, label: '1年' },
  { value: 2, label: '2年' },
  { value: 3, label: '3年' }
];

// Steps in the order process
const steps = ['填写订单信息', '确认协议条款', '确认订单'];

const PartnerOrderForm = () => {
  const navigate = useNavigate();
  const partnerInfo = partnerAuth.getPartnerInfo();
  
  // Order form state
  const [activeStep, setActiveStep] = useState(0);
  const [orderItems, setOrderItems] = useState([
    {
      ProductName: 'Dify Enterprise',
      LicenseType: '',
      Quantity: 1,
      UnitPrice: 0,
      TotalPrice: 0,
      LicenseDurationYears: 1,
      TaxRate: 0.03,
      EndUserName: ''
    }
  ]);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // License type prices (示例价格，实际价格需要从后端获取)
  const licenseTypePrices = {
    '标准版': 39800,
    '高级版': 69800,
    '旗舰版': 99800
  };
  
  // Calculate total order amount
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.TotalPrice, 0);
  };
  
  // Update price calculations when license type, quantity, or duration changes
  const updatePriceCalculations = (index, item) => {
    const updatedItems = [...orderItems];
    const basePrice = licenseTypePrices[item.LicenseType] || 0;
    
    // Apply duration multiplier with discount for multi-year
    let durationMultiplier = 1;
    if (item.LicenseDurationYears === 2) {
      durationMultiplier = 1.9; // 5% discount for 2 years
    } else if (item.LicenseDurationYears === 3) {
      durationMultiplier = 2.7; // 10% discount for 3 years
    } else {
      durationMultiplier = item.LicenseDurationYears;
    }
    
    const unitPrice = basePrice * durationMultiplier;
    const subtotal = unitPrice * item.Quantity;
    const totalWithTax = subtotal * (1 + item.TaxRate);
    
    updatedItems[index] = {
      ...item,
      UnitPrice: unitPrice,
      TotalPrice: Math.round(totalWithTax * 100) / 100 // Round to 2 decimal places
    };
    
    setOrderItems(updatedItems);
  };
  
  // Handle changes to order item fields
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // If price-related field changed, update calculations
    if (['LicenseType', 'Quantity', 'LicenseDurationYears', 'TaxRate'].includes(field)) {
      updatePriceCalculations(index, updatedItems[index]);
    } else {
      setOrderItems(updatedItems);
    }
  };
  
  // Add a new license item to the order
  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        ProductName: 'Dify Enterprise',
        LicenseType: '',
        Quantity: 1,
        UnitPrice: 0,
        TotalPrice: 0,
        LicenseDurationYears: 1,
        TaxRate: 0.03,
        EndUserName: ''
      }
    ]);
  };
  
  // Remove an item from the order
  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      const updatedItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(updatedItems);
    }
  };
  
  // Navigate to next step
  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      // Validate order items
      const isValid = orderItems.every(item => 
        item.LicenseType && 
        item.Quantity > 0 && 
        item.EndUserName
      );
      
      if (!isValid) {
        setError('请填写所有必填字段');
        return;
      }
    } else if (activeStep === 1) {
      // Validate agreement
      if (!agreementChecked) {
        setError('请勾选同意协议条款');
        return;
      }
    }
    
    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Go back to previous step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Submit the order
  const handleSubmitOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare order data
      const orderData = {
        AgreementAcknowledged: agreementChecked,
        OrderItems: orderItems,
        Notes: notes
      };
      
      // Submit to API
      const result = await partnerOrders.createOrder(orderData);
      
      // Navigate to success page
      navigate('/partner/order-success', { 
        state: { orderId: result.OrderId, orderNumber: result.OrderNumber } 
      });
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        '提交订单失败，请稍后重试'
      );
      setActiveStep(0); // Go back to first step on error
    } finally {
      setLoading(false);
    }
  };
  
  // Render functions for each step
  const renderOrderForm = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        填写Dify.AI企业版授权订单
      </Typography>
      
      {orderItems.map((item, index) => (
        <Paper key={index} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">
                授权 #{index + 1}
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="授权类型"
                value={item.LicenseType}
                onChange={(e) => handleItemChange(index, 'LicenseType', e.target.value)}
              >
                {LICENSE_TYPES.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="最终用户名称"
                value={item.EndUserName}
                onChange={(e) => handleItemChange(index, 'EndUserName', e.target.value)}
                helperText="请填写实际使用本软件的公司名称"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="授权年限"
                value={item.LicenseDurationYears}
                onChange={(e) => handleItemChange(index, 'LicenseDurationYears', parseInt(e.target.value))}
              >
                {DURATION_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="授权数量"
                value={item.Quantity}
                InputProps={{ inputProps: { min: 1 } }}
                onChange={(e) => handleItemChange(index, 'Quantity', parseInt(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                disabled
                label="单价"
                value={`¥${item.UnitPrice.toLocaleString()}`}
                InputProps={{
                  readOnly: true,
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="税率"
                value={item.TaxRate}
                onChange={(e) => handleItemChange(index, 'TaxRate', parseFloat(e.target.value))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                disabled
                label="总价(含税)"
                value={`¥${item.TotalPrice.toLocaleString()}`}
                InputProps={{
                  readOnly: true,
                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                }}
              />
            </Grid>
            
            {orderItems.length > 1 && (
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => removeOrderItem(index)}
                >
                  移除此授权
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      ))}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          variant="outlined" 
          onClick={addOrderItem}
        >
          + 添加另一个授权
        </Button>
        
        <TextField
          multiline
          rows={2}
          fullWidth
          sx={{ mx: 2 }}
          label="订单备注(可选)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Box>
    </Box>
  );
  
  const renderAgreementStep = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        确认协议条款
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          根据双方于【    】年【    】月【    】日签署的《DIFY.AI合作协议》（以下简称"原协议"），双方同意订立此订单，甲方将向乙方购买如下授权许可：
        </Typography>
        
        <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            订单明细:
          </Typography>
          
          {orderItems.map((item, index) => (
            <Box key={index} sx={{ mt: 2 }}>
              <Typography>
                {index + 1}. {item.EndUserName} - {LICENSE_TYPES.find(t => t.value === item.LicenseType)?.label} 
                × {item.Quantity}套, 授权期限{item.LicenseDurationYears}年, 
                总价：¥{item.TotalPrice.toLocaleString()}
              </Typography>
            </Box>
          ))}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography fontWeight="bold">
            合同总金额: ¥{calculateTotal().toLocaleString()}
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          一、结算方式：以双方签署的《DIFY.AI合作协议》附件一约定为准。
        </Typography>
        
        <Typography variant="body1" paragraph>
          二、许可证有效期：自最终用户首次激活之日起1年有效，最终用户应自许可证发送之日起7个自然日内激活，否则将于发送之日起第7个自然日起算1年有效期。如最终用户有特殊要求，则以双方另行书面确认的有效期为准。
        </Typography>
        
        <Typography variant="body1" paragraph>
          三、本订单一式两份，双方各执壹份，自双方加盖公司合同专用章或公章之日起生效。
        </Typography>
        
        <Typography variant="body1" paragraph>
          四、本订单为主合同的一部分，本订单中约定与原协议不一致的，以本订单为准；本订单未尽事宜，仍执行原协议的约定。
        </Typography>
        
        <FormControlLabel
          control={
            <Checkbox 
              checked={agreementChecked} 
              onChange={(e) => setAgreementChecked(e.target.checked)} 
              color="primary"
            />
          }
          label="本人已阅读并同意以上协议条款，并代表本公司确认订购上述授权许可。"
          sx={{ mt: 2 }}
        />
      </Paper>
    </Box>
  );
  
  const renderConfirmation = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        确认订单信息
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">合作伙伴:</Typography>
            <Typography variant="body1" gutterBottom>{partnerInfo?.PartnerName}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">联系人:</Typography>
            <Typography variant="body1" gutterBottom>{partnerInfo?.ContactPerson}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>订单明细:</Typography>
          </Grid>
          
          {orderItems.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2">
                    {index + 1}. {LICENSE_TYPES.find(t => t.value === item.LicenseType)?.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最终用户: {item.EndUserName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    授权数量: {item.Quantity}套 × 授权期限: {item.LicenseDurationYears}年
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                    总价: ¥{item.TotalPrice.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">备注:</Typography>
            <Typography variant="body2">{notes || '无'}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" align="right" sx={{ mt: 2 }}>
              订单总金额: ¥{calculateTotal().toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderOrderForm();
      case 1:
        return renderAgreementStep();
      case 2:
        return renderConfirmation();
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        创建Dify.AI授权订单
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {getStepContent(activeStep)}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
        >
          返回
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitOrder}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? '提交中...' : '提交订单'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={loading}
            >
              下一步
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PartnerOrderForm;
