import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Licenses from './pages/licenses/Licenses';
import LicenseDetail from './pages/licenses/LicenseDetail';
import Deployments from './pages/deployments/Deployments';
import DeploymentDetail from './pages/deployments/DeploymentDetail';
import Customers from './pages/customers/Customers';
import CustomerDetail from './pages/customers/CustomerDetail';
import Engineers from './pages/engineers/Engineers';
import EngineerDetail from './pages/engineers/EngineerDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="licenses">
              <Route index element={<Licenses />} />
              <Route path=":id" element={<LicenseDetail />} />
            </Route>
            <Route path="deployments">
              <Route index element={<Deployments />} />
              <Route path=":id" element={<DeploymentDetail />} />
            </Route>
            <Route path="customers">
              <Route index element={<Customers />} />
              <Route path=":id" element={<CustomerDetail />} />
            </Route>
            <Route path="engineers">
              <Route index element={<Engineers />} />
              <Route path=":id" element={<EngineerDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
