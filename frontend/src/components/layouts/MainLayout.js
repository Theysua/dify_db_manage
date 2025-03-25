import {
  DashboardOutlined,
  KeyOutlined,
  RocketOutlined,
  ToolOutlined,
  UserOutlined,
  ControlOutlined,
  TeamOutlined,
  ShopOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, message, theme } from 'antd';
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState(['/partner-management']);
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">许可管理</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div className="logo" style={{ color: 'black', width: 200, paddingLeft: 16 }}>
            许可证管理系统
          </div>
          <Button 
            type="link" 
            onClick={() => {
              localStorage.removeItem('dify_token');
              localStorage.removeItem('dify_user_info');
              message.success('已成功退出登录');
              navigate('/login');
            }}
            style={{ marginRight: 20 }}
          >
            退出登录
          </Button>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              marginTop: 16,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Dify 许可证管理系统 ©{new Date().getFullYear()} 由 Xuan 创建
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
