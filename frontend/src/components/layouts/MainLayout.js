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
import { Layout, Menu, theme } from 'antd';
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
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
      key: 'partner-management',
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
    for (const item of menuItems) {
      if (path === item.key || path.startsWith(item.key + '/')) {
        return [item.key];
      }
    }
    return ['/'];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">许可管理</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <div className="logo" style={{ color: 'black', width: 200 }}>
            许可证管理系统
          </div>
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
