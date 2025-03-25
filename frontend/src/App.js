import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import PartnerLayout from './components/layouts/PartnerLayout';

// Admin Pages
import Dashboard from './pages/Dashboard';
import Licenses from './pages/licenses/Licenses';
import LicenseDetail from './pages/licenses/LicenseDetail';
import Deployments from './pages/deployments/Deployments';
import DeploymentDetail from './pages/deployments/DeploymentDetail';
import Customers from './pages/customers/Customers';
import CustomerDetail from './pages/customers/CustomerDetail';
import SalesReps from './pages/sales_reps/SalesReps';
import SalesRepDetail from './pages/sales_reps/SalesRepDetail';
import Engineers from './pages/engineers/Engineers';
import EngineerDetail from './pages/engineers/EngineerDetail';
import Operations from './pages/operations/Operations';
import NotFound from './pages/NotFound';

// Partner Pages
import PartnerDashboard from './pages/partner/Dashboard';
import PartnerOrderForm from './pages/partner/OrderForm';
import PartnerOrderSuccess from './pages/partner/OrderSuccess';
import PartnerOrderDetails from './pages/partner/OrderDetails';
import PartnerOrderHistory from './pages/partner/OrderHistory';
import PartnerProfile from './pages/partner/Profile';

// Partner Management (Admin) Pages
import PartnerOrders from './pages/partner_management/PartnerOrders';
import PartnerOrderDetail from './pages/partner_management/PartnerOrderDetail';
import Partners from './pages/partner_management/Partners';
import CreateOrder from './pages/partner_management/CreateOrder';
import PartnerOrdersList from './pages/partner_management/PartnerOrdersList';

// Auth Pages
import Login from './pages/Login';

// Auth Helpers
const isAuthenticated = () => {
  const token = localStorage.getItem('dify_token');
  const userInfo = localStorage.getItem('dify_user_info');
  return !!token && !!userInfo;
};

const isPartnerAuthenticated = () => {
  const token = localStorage.getItem('dify_partner_token');
  const partnerInfo = localStorage.getItem('dify_partner_info');
  return !!token && !!partnerInfo;
};

// Protected route component for staff/admin pages
const ProtectedRoute = ({ children, requiredRole = null }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // 如果指定了所需角色，检查用户是否有该角色
  if (requiredRole) {
    const userInfo = JSON.parse(localStorage.getItem('dify_user_info') || '{}');
    const userRole = userInfo.role || '';
    
    // 检查用户角色是否匹配所需角色
    // admin可以访问所有页面
    if (userRole !== 'admin' && userRole !== requiredRole) {
      return <Navigate to="/not-found" replace />;
    }
  }
  
  return children;
};

// Protected route component for partner pages
const PartnerProtectedRoute = ({ children }) => {
  if (!isPartnerAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          {/* 登录路由 */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="licenses">
              <Route index element={<ProtectedRoute><Licenses /></ProtectedRoute>} />
              <Route path=":licenseId" element={<ProtectedRoute><LicenseDetail /></ProtectedRoute>} />
            </Route>
            <Route path="deployments">
              <Route index element={<ProtectedRoute><Deployments /></ProtectedRoute>} />
              <Route path=":id" element={<ProtectedRoute><DeploymentDetail /></ProtectedRoute>} />
            </Route>
            <Route path="customers">
              <Route index element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path=":id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
            </Route>
            <Route path="sales-reps">
              <Route index element={<ProtectedRoute><SalesReps /></ProtectedRoute>} />
              <Route path=":id" element={<ProtectedRoute><SalesRepDetail /></ProtectedRoute>} />
            </Route>
            <Route path="engineers">
              <Route index element={<ProtectedRoute><Engineers /></ProtectedRoute>} />
              <Route path=":id" element={<ProtectedRoute><EngineerDetail /></ProtectedRoute>} />
            </Route>
            <Route path="operations" element={<ProtectedRoute><Operations /></ProtectedRoute>} />
            <Route path="partner-management">
              <Route path="orders" element={<ProtectedRoute><PartnerOrders /></ProtectedRoute>} />
              <Route path="orders/new" element={<ProtectedRoute><CreateOrder /></ProtectedRoute>} />
              <Route path="orders/:orderId" element={<ProtectedRoute><PartnerOrderDetail /></ProtectedRoute>} />
              <Route path="partners" element={<ProtectedRoute><Partners /></ProtectedRoute>} />
              <Route path="partners/:partnerId/orders" element={<ProtectedRoute><PartnerOrdersList /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Partner Routes */}
          <Route 
            path="/partner" 
            element={
              <PartnerProtectedRoute>
                <PartnerLayout />
              </PartnerProtectedRoute>
            }
          >
            <Route index element={<PartnerDashboard />} />
            <Route path="dashboard" element={<PartnerDashboard />} />
            <Route path="orders">
              <Route index element={<PartnerOrderHistory />} />
              <Route path="new" element={<PartnerOrderForm />} />
              <Route path=":orderId" element={<PartnerOrderDetails />} />
            </Route>
            <Route path="order-success" element={<PartnerOrderSuccess />} />
            <Route path="profile" element={<PartnerProfile />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
