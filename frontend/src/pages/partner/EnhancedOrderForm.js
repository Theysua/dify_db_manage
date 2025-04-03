import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Steps,
  Card,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Checkbox,
  message,
  Alert,
  Tooltip,
  Spin,
  Result
} from 'antd';
import {
  InfoCircleOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  RightOutlined,
  LeftOutlined,
  CheckOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  FileDoneOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { partnerAuth, partnerOrders } from '../../services/partnerApi';
import { brandColors, darkModeColors } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

const { Text, Title, Paragraph, Link } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 产品和授权配置选项
const LICENSE_TYPES = [
  { value: 'BASIC', label: 'Dify企业版 - 基础版', description: '适合团队规模较小的企业，提供基础AI功能' },
  { value: 'STANDARD', label: 'Dify企业版 - 标准版', description: '适合中型企业，提供更多高级功能和API限额' },
  { value: 'PROFESSIONAL', label: 'Dify企业版 - 专业版', description: '适合大型企业，提供更高的自定义性和扩展性' },
  { value: 'ENTERPRISE', label: 'Dify企业版 - 旗舰版', description: '适合特大型企业，提供全方位支持和完全定制化' }
];

// 授权年限选项
const DURATION_OPTIONS = [
  { value: 1, label: '1年期' },
  { value: 2, label: '2年期', discount: 0.95 }, // 95%的价格，相当于5%折扣
  { value: 3, label: '3年期', discount: 0.90 }  // 90%的价格，相当于10%折扣
];

// 用户规模选项
const USER_SCALE_OPTIONS = [
  { value: 'SMALL', label: '小型 (5-20人)', defaultUsers: 10 },
  { value: 'MEDIUM', label: '中型 (20-100人)', defaultUsers: 50 },
  { value: 'LARGE', label: '大型 (100-500人)', defaultUsers: 200 },
  { value: 'ENTERPRISE', label: '超大型 (500人以上)', defaultUsers: 500 }
];

// 基础价格参考 (实际应当从API获取)
const BASE_PRICES = {
  'BASIC': 28000,
  'STANDARD': 58000,
  'PROFESSIONAL': 98000,
  'ENTERPRISE': 168000
};

/**
 * 增强版合作伙伴订单表单
 * 实现了四个主要优化:
 * 1. 分步引导流程
 * 2. 表单组织优化
 * 3. 智能默认值
 * 4. 字段提示增强
 */
const EnhancedOrderForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { darkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [orderPreview, setOrderPreview] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  
  // 步骤定义
  const steps = [
    {
      title: '基本信息',
      icon: <UserOutlined />,
      description: '填写基本信息'
    },
    {
      title: '产品选择',
      icon: <ShoppingCartOutlined />,
      description: '选择产品和配置'
    },
    {
      title: '确认订单',
      icon: <FileDoneOutlined />,
      description: '确认订单详情'
    },
    {
      title: '支付方式',
      icon: <CreditCardOutlined />,
      description: '选择支付方式'
    }
  ];

  // 获取合作伙伴数据和智能默认值
  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        setInitialLoading(true);
        
        // 1. 获取合作伙伴资料
        const profileResponse = await partnerOrders.getPartnerProfile();
        setPartnerProfile(profileResponse);
        
        // 2. 获取最近订单历史
        const ordersResponse = await partnerOrders.getRecentOrders(5);
        setRecentOrders(ordersResponse);
        
        // 设置智能默认值
        setupIntelligentDefaults(profileResponse, ordersResponse);
      } catch (error) {
        console.error('加载合作伙伴数据失败:', error);
        message.error('无法加载您的数据，请刷新页面重试');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchPartnerData();
  }, [form]);
  
  // 基于合作伙伴历史设置智能默认值
  const setupIntelligentDefaults = (profile, orders) => {
    if (!profile) return;
    
    // 默认基本信息
    const basicDefaults = {
      companyName: profile.companyName,
      contactPerson: profile.contactName,
      contactEmail: profile.email,
      contactPhone: profile.phone
    };
    
    // 分析历史订单找出常用配置
    let preferredConfig = {
      licenseType: 'STANDARD', // 默认标准版
      duration: 1, // 默认1年
      quantity: 1
    };
    
    // 如果有历史订单，分析偏好
    if (orders && orders.length > 0) {
      // 获取最常用的许可证类型
      const licenseCounts = {};
      const durationCounts = {};
      let totalQuantity = 0;
      
      orders.forEach(order => {
        order.items.forEach(item => {
          // 统计许可证类型
          if (item.licenseType) {
            licenseCounts[item.licenseType] = (licenseCounts[item.licenseType] || 0) + 1;
          }
          
          // 统计期限
          if (item.duration) {
            durationCounts[item.duration] = (durationCounts[item.duration] || 0) + 1;
          }
          
          // 累计数量
          if (item.quantity) {
            totalQuantity += item.quantity;
          }
        });
      });
      
      // 找出最常用的许可证类型
      let maxCount = 0;
      Object.entries(licenseCounts).forEach(([type, count]) => {
        if (count > maxCount) {
          preferredConfig.licenseType = type;
          maxCount = count;
        }
      });
      
      // 找出最常用的期限
      maxCount = 0;
      Object.entries(durationCounts).forEach(([duration, count]) => {
        if (count > maxCount) {
          preferredConfig.duration = parseInt(duration);
          maxCount = count;
        }
      });
      
      // 计算平均数量
      preferredConfig.quantity = Math.max(1, Math.round(totalQuantity / orders.length));
    }
    
    // 设置表单默认值
    form.setFieldsValue({
      ...basicDefaults,
      licenseType: preferredConfig.licenseType,
      duration: preferredConfig.duration,
      quantity: preferredConfig.quantity
    });
  };

  // 下一步逻辑
  const handleNext = async () => {
    try {
      // 验证当前步骤表单
      const values = await form.validateFields();
      
      // 保存当前步骤数据
      setFormData(prevData => ({
        ...prevData,
        ...values
      }));
      
      // 如果是最后一步，提交订单
      if (currentStep === steps.length - 1) {
        handleSubmitOrder();
      } else {
        // 否则前进到下一步
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };
  
  // 上一步逻辑
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // 提交订单
  const handleSubmitOrder = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      // 准备订单数据
      const orderData = {
        ...formData,
        agreementChecked
      };
      
      // 调用API提交订单
      const result = await partnerOrders.createOrder(orderData);
      
      // 设置订单预览数据
      setOrderPreview({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        totalAmount: result.totalAmount,
        createdAt: new Date().toISOString()
      });
      
      // 显示成功提示
      message.success('订单创建成功！');
      
      // 前进到完成步骤
      setCurrentStep(steps.length);
    } catch (error) {
      console.error('提交订单失败:', error);
      setError(error.response?.data?.message || '提交订单失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 将数字转换为中文大写金额
  const numberToChinese = (num) => {
    if (num === 0) return '零元整';
    if (!num || isNaN(num)) return '';
    
    const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const positions = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
    
    // 处理整数部分
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);
    
    let result = '';
    const intStr = integerPart.toString();
    
    for (let i = 0; i < intStr.length; i++) {
      const digit = parseInt(intStr[i]);
      const position = positions[intStr.length - i - 1];
      
      if (digit !== 0) {
        result += digits[digit] + position;
      } else {
        if (result.charAt(result.length - 1) !== '零') {
          result += '零';
        }
      }
    }
    
    result += '元';
    
    // 处理小数部分
    if (decimalPart > 0) {
      const jiao = Math.floor(decimalPart / 10);
      const fen = decimalPart % 10;
      
      if (jiao > 0) {
        result += digits[jiao] + '角';
      }
      
      if (fen > 0) {
        result += digits[fen] + '分';
      }
    } else {
      result += '整';
    }
    
    return result;
  };
  
  // 计算价格
  const calculatePrice = (licenseType, quantity, duration) => {
    // 获取基础价格
    const basePrice = BASE_PRICES[licenseType] || 0;
    
    // 查找年限折扣
    const durationOption = DURATION_OPTIONS.find(opt => opt.value === duration);
    const durationDiscount = durationOption?.discount || 1.0;
    
    // 计算总价(基础价格 * 数量 * 年限 * 折扣)
    const totalPrice = basePrice * quantity * duration * durationDiscount;
    
    return {
      unitPrice: basePrice * durationDiscount,
      totalPrice: totalPrice
    };
  };
  
  // 动态更新价格计算
  useEffect(() => {
    // 只在用户已选择授权类型、数量和年限后计算
    const values = form.getFieldsValue(['licenseType', 'quantity', 'duration', 'discount']);
    
    if (values.licenseType && values.quantity && values.duration) {
      const { unitPrice, totalPrice } = calculatePrice(
        values.licenseType,
        values.quantity,
        values.duration
      );
      
      // 应用折扣（如果有）
      const discount = values.discount || 0;
      const finalPrice = totalPrice * (1 - discount / 100);
      
      // 更新表单中的价格字段
      form.setFieldsValue({
        unitPrice: unitPrice,
        totalPrice: finalPrice,
        priceChinese: numberToChinese(finalPrice)
      });
    }
  }, [form]);
  
  // 获取当前步骤的组件
  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderProductSelectionStep();
      case 2:
        return renderConfirmOrderStep();
      case 3:
        return renderPaymentStep();
      case 4: // 完成步骤
        return renderCompletionStep();
      default:
        return null;
    }
  };
  
  // 渲染步骤1: 基本信息
  const renderBasicInfoStep = () => {
    return (
      <Card title="基本订单信息" bordered={false} className="form-card">
        <Alert
          message="请填写您的基本信息，用于生成订单和联系"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="companyName"
              label="公司名称"
              rules={[{ required: true, message: '请输入公司名称' }]}
              tooltip={{ 
                title: '公司全称', 
                icon: <InfoCircleOutlined /> 
              }}
            >
              <Input 
                placeholder="请输入公司全称"
                prefix={<UserOutlined />}
                disabled={partnerProfile && partnerProfile.companyName}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="businessLicense"
              label="营业执照号码"
              rules={[{ required: true, message: '请输入营业执照号码' }]}
              tooltip="用于开具发票和合同签署"
            >
              <Input placeholder="请输入统一社会信用代码" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="contactPerson"
              label="联系人"
              rules={[{ required: true, message: '请输入联系人姓名' }]}
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="contactPosition"
              label="职位"
              tooltip="联系人在公司中的职务"
            >
              <Input placeholder="例如：技术总监、采购经理" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="contactEmail"
              label="电子邮箱"
              rules={[
                { required: true, message: '请输入联系人电子邮箱' },
                { type: 'email', message: '请输入有效的电子邮箱地址' }
              ]}
              tooltip="用于发送订单确认和授权信息"
            >
              <Input placeholder="example@company.com" />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="contactPhone"
              label="联系电话"
              rules={[{ required: true, message: '请输入联系电话' }]}
              tooltip="方便我们与您联系确认订单信息"
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider dashed><Text type="secondary">用户规模信息</Text></Divider>
        
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              name="userScale"
              label="团队规模"
              tooltip={{
                title: '您的团队或公司规模，帮助我们推荐适合的配置',
                icon: <QuestionCircleOutlined />
              }}
            >
              <Select placeholder="请选择团队规模">
                {USER_SCALE_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="industry"
              label="所属行业"
              tooltip="您公司所属的行业，帮助我们了解您的业务需求"
            >
              <Input placeholder="例如：金融、教育、医疗等" />
            </Form.Item>
          </Col>
        </Row>
        
        {recentOrders.length > 0 && (
          <Alert
            message="基于您的历史订单，我们已为您预填部分信息"
            description="您可以根据需要修改这些信息"
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    );
  };

};

export default EnhancedOrderForm;
