import {
  DashboardOutlined,
  KeyOutlined,
  RocketOutlined,
  ToolOutlined,
  UserOutlined,
  ControlOutlined,
  TeamOutlined,
  ShopOutlined,
  ShoppingOutlined,
  FunnelPlotOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, message, Dropdown, Avatar, Badge, Tooltip, Space, Divider } from 'antd';
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import ThemeSwitcher from '../common/ThemeSwitcher';
import { motion } from 'framer-motion';
import { brandColors } from '../../styles/theme';

const { Header, Content, Footer, Sider } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState(['/partner-management']);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, user } = useAuth();
  const { darkMode } = useTheme();
  
  // 现代化UI颜色，根据主题模式动态设置
  const colorBgContainer = darkMode ? '#1f1f1f' : '#ffffff';
  const colorBgMenu = darkMode ? '#141414' : '#001529';
  const textColor = darkMode ? '#ffffff' : '#000000';

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/licenses',
      icon: <KeyOutlined />,
      label: '许可证查询与管理',
    },
    {
      key: '/deployments',
      icon: <RocketOutlined />,
      label: '部署管理',
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: '客户管理',
    },
    {
      key: '/sales-reps',
      icon: <TeamOutlined />,
      label: '销售人员管理',
    },
    {
      key: '/engineers',
      icon: <ToolOutlined />,
      label: '工程师管理',
    },
    {
      key: '/operations',
      icon: <ControlOutlined />,
      label: '运营工作台（新建许可证）',
    },
    {
      key: '/leads',
      icon: <FunnelPlotOutlined />,
      label: '商机管理',
      children: [
        {
          key: '/leads',
          label: '商机列表',
        },
        {
          key: '/leads/workbench',
          label: '销售工作台',
        },
        // 只有管理员才能看到商机设置
        ...((() => {
          const adminStatus = isAdmin();
          console.log('导航菜单中的管理员状态:', adminStatus);
          return adminStatus ? [
            {
              key: '/leads/settings',
              icon: <SettingOutlined />,
              label: '商机设置',
            }
          ] : [];
        })())
      ]
    },
    {
      key: '/partner-management',
      icon: <ShopOutlined />,
      label: '合作伙伴管理',
      children: [
        {
          key: '/partner-management/partners',
          icon: <TeamOutlined />,
          label: '合作伙伴列表',
        },
        {
          key: '/partner-management/orders',
          icon: <ShoppingOutlined />,
          label: '订单管理',
        }
      ]
    },
  ];

  const getSelectedKeys = () => {
    const path = location.pathname;
    
    // 精确匹配子菜单路径
    if (path === '/leads/workbench') {
      return ['/leads/workbench'];
    }
    
    if (path === '/leads/settings') {
      return ['/leads/settings'];
    }
    
    // 首先检查子菜单项
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (path === child.key || path.startsWith(child.key + '/')) {
            return [child.key];
          }
        }
      }
    }
    
    // 然后检查父菜单项
    for (const item of menuItems) {
      if (path === item.key || path.startsWith(item.key + '/')) {
        return [item.key];
      }
    }
    
    return ['/'];
  };
  
  // 初始化打开的子菜单
  useEffect(() => {
    const path = location.pathname;
    let newOpenKeys = [];
    
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (path === child.key || path.startsWith(child.key + '/')) {
            newOpenKeys = [item.key];
            break;
          }
        }
      }
    }
    
    if (newOpenKeys.length > 0) {
      setOpenKeys(newOpenKeys);
    }
  }, [location.pathname]);
  
  // 处理子菜单展开/折叠
  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          background: colorBgMenu
        }}
        trigger={null}
        width={250}
      >
        <motion.div 
          className="logo"
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 24px',
            color: '#fff',
            fontSize: collapsed ? '18px' : '20px',
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            transition: 'all 0.3s'
          }}
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        >
          {!collapsed && 'Dify 许可管理'}
          {collapsed && 'D'}
        </motion.div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, background: colorBgMenu }}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            width: '100%',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
            borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <span style={{ fontSize: '18px', marginLeft: '8px', color: textColor }}>
              Dify 销售管理系统
            </span>
          </div>
          
          <Space size={16}>
            <ThemeSwitcher />
            
            <Tooltip title="通知">
              <Badge count={5} size="small">
                <Button type="text" icon={<BellOutlined />} style={{ fontSize: '16px' }} />
              </Badge>
            </Tooltip>
            
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'profile',
                    label: '个人中心',
                    onClick: () => navigate('/profile')
                  },
                  {
                    key: 'settings',
                    label: '账号设置',
                    onClick: () => navigate('/settings')
                  },
                  { type: 'divider' },
                  {
                    key: 'logout',
                    danger: true,
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: () => {
                      localStorage.removeItem('dify_token');
                      localStorage.removeItem('dify_user_info');
                      message.success('已成功退出登录');
                      navigate('/login');
                    }
                  }
                ]
              }}
              placement="bottomRight"
              arrow={{
                pointAtCenter: true,
              }}
            >
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  style={{ 
                    backgroundColor: brandColors.primary,
                    marginRight: '8px' 
                  }}
                >
                  {user?.name?.[0] || 'U'}
                </Avatar>
                <span style={{ color: textColor }}>{user?.name || '用户'}</span>
              </div>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '16px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: 24,
              minHeight: 'calc(100vh - 160px)', // 减去Header和Footer的高度
              background: colorBgContainer,
              borderRadius: '8px',
              boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
              border: darkMode ? '1px solid #303030' : 'none'
            }}
          >
            <Outlet />
          </motion.div>
        </Content>
        <Footer 
          style={{ 
            textAlign: 'center',
            padding: '12px 50px',
            color: darkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)',
            background: colorBgContainer,
            borderTop: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Dify 许可证管理系统 ©{new Date().getFullYear()} 由 Xuan 创建</span>
            <Space split={<Divider type="vertical" />}>
              <a href="#">帮助文档</a>
              <a href="#">API</a>
              <a href="#">隐私政策</a>
            </Space>
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
