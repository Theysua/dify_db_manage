import React, { useState, useEffect } from 'react';
import { Alert, Card, List, Typography, Button, Space, Tooltip } from 'antd';
import { WarningOutlined, InfoCircleOutlined, ExclamationCircleOutlined, RightOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Title, Text } = Typography;

/**
 * Component to display license alerts such as expiring licenses and overused licenses
 */
const LicenseAlerts = () => {
  const [expiringLicenses, setExpiringLicenses] = useState([]);
  const [overusedLicenses, setOverusedLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        // In a real implementation, these would be separate API calls for expiring and overused licenses
        // For now, we'll use the same endpoint and filter the results
        const response = await axios.get('/api/v1/licenses');
        
        // Filter licenses that are expiring within 30 days
        const thirtyDaysFromNow = moment().add(30, 'days');
        const expiring = response.data.filter(license => 
          license.LicenseStatus === 'ACTIVE' && 
          moment(license.ExpiryDate).isBefore(thirtyDaysFromNow)
        ).sort((a, b) => moment(a.ExpiryDate).diff(moment(b.ExpiryDate)));
        
        // Filter licenses that are overusing workspaces or users
        const overused = response.data.filter(license => 
          (license.ActualWorkspaces > license.AuthorizedWorkspaces) ||
          (license.ActualUsers > license.AuthorizedUsers)
        );
        
        setExpiringLicenses(expiring);
        setOverusedLicenses(overused);
      } catch (error) {
        console.error('Error fetching license alerts:', error);
        
        // Mock data for UI development
        const mockExpiringLicenses = [
          {
            LicenseID: 'ENT-2025-001',
            CustomerName: '测试客户 1',
            ExpiryDate: moment().add(5, 'days').format('YYYY-MM-DD'),
            StartDate: moment().subtract(360, 'days').format('YYYY-MM-DD'),
            LicenseStatus: 'ACTIVE'
          },
          {
            LicenseID: 'ENT-2025-002',
            CustomerName: '测试客户 2',
            ExpiryDate: moment().add(20, 'days').format('YYYY-MM-DD'),
            StartDate: moment().subtract(345, 'days').format('YYYY-MM-DD'),
            LicenseStatus: 'ACTIVE'
          }
        ];
        
        const mockOverusedLicenses = [
          {
            LicenseID: 'ENT-2025-003',
            CustomerName: '测试客户 3',
            AuthorizedWorkspaces: 5,
            ActualWorkspaces: 7,
            AuthorizedUsers: 25,
            ActualUsers: 25,
            ExpiryDate: moment().add(180, 'days').format('YYYY-MM-DD'),
            LicenseStatus: 'ACTIVE'
          },
          {
            LicenseID: 'ENT-2025-004',
            CustomerName: '测试客户 4',
            AuthorizedWorkspaces: 10,
            ActualWorkspaces: 10,
            AuthorizedUsers: 50,
            ActualUsers: 63,
            ExpiryDate: moment().add(90, 'days').format('YYYY-MM-DD'),
            LicenseStatus: 'ACTIVE'
          }
        ];
        
        setExpiringLicenses(mockExpiringLicenses);
        setOverusedLicenses(mockOverusedLicenses);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
  }, []);
  
  if (expiringLicenses.length === 0 && overusedLicenses.length === 0) {
    return null;
  }
  
  return (
    <div className="license-alerts-container" style={{ marginBottom: 24 }}>
      {expiringLicenses.length > 0 && (
        <Alert
          type="warning"
          message={
            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                <WarningOutlined style={{ marginRight: 8 }} />
                即将到期的许可证 ({expiringLicenses.length})
              </Title>
              <List
                size="small"
                dataSource={expiringLicenses.slice(0, 3)}
                renderItem={license => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => navigate(`/licenses/${license.LicenseID}`)}
                        icon={<RightOutlined />}
                      >
                        查看详情
                      </Button>
                    ]}
                  >
                    <Space direction="vertical" size={0}>
                      <Text strong>{license.CustomerName}</Text>
                      <Space>
                        <Text code>{license.LicenseID}</Text>
                        <Text type="danger">
                          {moment(license.ExpiryDate).diff(moment(), 'days') <= 0 
                            ? '已过期' 
                            : `${moment(license.ExpiryDate).diff(moment(), 'days')} 天后到期`}
                        </Text>
                      </Space>
                    </Space>
                  </List.Item>
                )}
                footer={
                  expiringLicenses.length > 3 && (
                    <div style={{ textAlign: 'center' }}>
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => navigate('/licenses?filter=expiring')}
                      >
                        查看全部 {expiringLicenses.length} 个
                      </Button>
                    </div>
                  )
                }
              />
            </div>
          }
          banner
        />
      )}
      
      {overusedLicenses.length > 0 && (
        <Alert
          type="error"
          message={
            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                超额使用的许可证 ({overusedLicenses.length})
              </Title>
              <List
                size="small"
                dataSource={overusedLicenses.slice(0, 3)}
                renderItem={license => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => navigate(`/licenses/${license.LicenseID}`)}
                        icon={<RightOutlined />}
                      >
                        查看详情
                      </Button>
                    ]}
                  >
                    <Space direction="vertical" size={0}>
                      <Text strong>{license.CustomerName}</Text>
                      <Space>
                        <Text code>{license.LicenseID}</Text>
                        <Space size={16}>
                          {license.ActualWorkspaces > license.AuthorizedWorkspaces && (
                            <Tooltip title="工作区超额使用">
                              <Text type="danger">
                                工作区: {license.ActualWorkspaces}/{license.AuthorizedWorkspaces}
                              </Text>
                            </Tooltip>
                          )}
                          {license.ActualUsers > license.AuthorizedUsers && (
                            <Tooltip title="用户超额使用">
                              <Text type="danger">
                                用户: {license.ActualUsers}/{license.AuthorizedUsers}
                              </Text>
                            </Tooltip>
                          )}
                        </Space>
                      </Space>
                    </Space>
                  </List.Item>
                )}
                footer={
                  overusedLicenses.length > 3 && (
                    <div style={{ textAlign: 'center' }}>
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => navigate('/licenses?filter=overused')}
                      >
                        查看全部 {overusedLicenses.length} 个
                      </Button>
                    </div>
                  )
                }
              />
            </div>
          }
          banner
        />
      )}
    </div>
  );
};

export default LicenseAlerts;
