import React, { useState, useEffect } from 'react';
import { Typography, Spin, message, Button, Space, Tabs } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import LicenseDetailComponent from '../../components/license/LicenseDetail';
import LicenseActivationManager from '../../components/LicenseActivation/LicenseActivationManager';

const { Title } = Typography;

const LicenseDetail = () => {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const { licenseId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchLicenseDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/licenses/${licenseId}`);
        setLicense(response.data);
      } catch (error) {
        console.error('Failed to fetch license details:', error);
        message.error('获取许可证详情失败');
        
        // Mock data for UI development if API fails
        const mockLicense = {
          LicenseID: licenseId || 'ENT-2025-001',
          CustomerID: 1,
          CustomerName: '测试客户',
          SalesRepID: 1,
          SalesRepName: '销售代表',
          ResellerID: null,
          ResellerName: null,
          ProductName: 'Dify Enterprise',
          LicenseType: '企业版',
          OrderDate: '2025-01-01',
          StartDate: '2025-01-01',
          ExpiryDate: '2026-01-01',
          AuthorizedWorkspaces: 100,
          AuthorizedUsers: 500,
          ActualWorkspaces: 45,
          ActualUsers: 320,
          DeploymentStatus: 'COMPLETED',
          DeploymentDate: '2025-01-15',
          LicenseStatus: 'ACTIVE',
          LastCheckDate: '2025-03-01',
          Notes: '这是一个测试许可证',
          PurchaseRecords: [
            {
              PurchaseID: 1,
              PurchaseType: 'NEW',
              PurchaseDate: '2025-01-01',
              OrderNumber: 'ORD-001',
              ContractNumber: 'CON-001',
              Amount: 10000,
              Currency: 'CNY',
              PaymentStatus: 'PAID',
              PaymentDate: '2025-01-05',
              WorkspacesPurchased: 100,
              UsersPurchased: 500,
              NewExpiryDate: '2026-01-01'
            },
            {
              PurchaseID: 2,
              PurchaseType: 'EXPANSION',
              PurchaseDate: '2025-06-01',
              OrderNumber: 'ORD-002',
              ContractNumber: 'CON-002',
              Amount: 5000,
              Currency: 'CNY',
              PaymentStatus: 'PAID',
              PaymentDate: '2025-06-05',
              WorkspacesPurchased: 0,
              UsersPurchased: 200,
              PreviousExpiryDate: '2026-01-01',
              NewExpiryDate: '2026-01-01'
            }
          ],
          DeploymentRecords: [
            {
              DeploymentID: 1,
              DeploymentType: 'INITIAL',
              DeploymentDate: '2025-01-10',
              Status: 'COMPLETED',
              EngineerName: '部署工程师',
              CompletionDate: '2025-01-15'
            }
          ],
          CreatedAt: '2025-01-01T00:00:00',
          UpdatedAt: '2025-03-01T00:00:00'
        };
        
        setLicense(mockLicense);
      } finally {
        setLoading(false);
      }
    };
    
    if (licenseId) {
      fetchLicenseDetails();
    }
  }, [licenseId]);
  
  // 检查当前用户是否是管理员
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // 实际应用中应该从认证状态获取用户角色
    // 这里简单模拟一下，实际项目中可能需要使用Context或Redux
    const checkUserRole = async () => {
      try {
        const response = await axios.get('/api/v1/users/me');
        setIsAdmin(response.data.role === 'admin' || response.data.role === 'commercial_ops');
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // 默认设为非管理员
        setIsAdmin(false);
        
        // 开发环境中临时设为管理员以便测试
        if (process.env.NODE_ENV === 'development') {
          setIsAdmin(true);
        }
      }
    };
    
    checkUserRole();
  }, []);
  
  return (
    <div className="license-detail-container">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <Space>
          <Button 
            icon={<LeftOutlined />} 
            onClick={() => navigate('/licenses')}
          >
            返回
          </Button>
          <Title level={2}>许可证详情</Title>
        </Space>
      </div>
      
      {loading ? (
        <Spin size="large" tip="加载中..." />
      ) : license ? (
        <Tabs defaultActiveKey="details" size="large">
          <Tabs.TabPane tab="基本信息" key="details">
            <LicenseDetailComponent license={license} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="激活管理" key="activation">
            <div style={{ padding: '20px 0' }}>
              <LicenseActivationManager licenseId={licenseId} isAdmin={isAdmin} />
            </div>
          </Tabs.TabPane>
        </Tabs>
      ) : (
        <div>未找到许可证信息</div>
      )}
    </div>
  );
};

export default LicenseDetail;
