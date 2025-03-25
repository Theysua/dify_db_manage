import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('admin');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('dify_token');
    const partnerToken = localStorage.getItem('dify_partner_token');
    const userInfo = JSON.parse(localStorage.getItem('dify_user_info') || '{}');
    const partnerInfo = JSON.parse(localStorage.getItem('dify_partner_info') || '{}');
    
    if (token && userInfo && userInfo.role) {
      // 根据用户角色重定向
      switch(userInfo.role) {
        case 'admin':
          navigate('/');
          break;
        case 'sales_rep':
          navigate('/');
          break;
        case 'engineer':
          navigate('/');
          break;
        default:
          navigate('/');
      }
    } else if (partnerToken && partnerInfo) {
      navigate('/partner');
    }
  }, [navigate]);

  const handleAdminLogin = async (values) => {
    setLoading(true);
    try {
      // 使用authAPI服务登录
      const response = await authAPI.login(values.username, values.password);
      
      const { access_token, token_type } = response.data;
      
      // 存储token
      localStorage.setItem('dify_token', access_token);
      
      // 获取用户信息
      const userInfoResponse = await authAPI.getCurrentUser();
      
      // 将用户信息存储到localstorage
      const userData = userInfoResponse.data;
      localStorage.setItem('dify_user_info', JSON.stringify(userData));
      localStorage.setItem('dify_user_role', userData.Role || 'admin');
      
      message.success('登录成功');
      
      // 重定向到主页
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      message.error('登录失败：' + (error.response?.data?.detail || '用户名或密码错误'));
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerLogin = async (values) => {
    setLoading(true);
    try {
      // 使用authAPI服务登录
      const response = await authAPI.partnerLogin(values.username, values.password);
      
      const { AccessToken, TokenType, Partner } = response.data;
      
      // 存储token和合作伙伴信息
      localStorage.setItem('dify_partner_token', AccessToken);
      localStorage.setItem('dify_partner_info', JSON.stringify(Partner));
      localStorage.setItem('dify_user_role', 'partner');
      
      message.success('登录成功');
      navigate('/partner');
    } catch (error) {
      console.error('Partner login error:', error);
      message.error('登录失败：' + (error.response?.data?.detail || '用户名或密码错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (values) => {
    if (activeTab === 'admin') {
      handleAdminLogin(values);
    } else {
      handlePartnerLogin(values);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f0f2f5'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>Dify管理系统</Title>
          <Text type="secondary">登录以继续访问系统</Text>
        </div>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="管理员登录" key="admin">
            <Form
              form={form}
              name="admin_login"
              initialValues={{ remember: true }}
              onFinish={handleSubmit}
              style={{ marginTop: 16 }}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名" 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="密码" 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  block
                  loading={loading}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="合作伙伴登录" key="partner">
            <Form
              form={form}
              name="partner_login"
              initialValues={{ remember: true }}
              onFinish={handleSubmit}
              style={{ marginTop: 16 }}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名" 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="密码" 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  block
                  loading={loading}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">© 2023-2025 Dify.AI Ltd. 保留所有权利</Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
