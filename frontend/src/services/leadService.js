import axios from 'axios';
import config from '../config';

// 导入模拟数据
import { mockLeadApi } from './mockLeadData';

// 是否使用模拟数据（开发环境使用）
const USE_MOCK_DATA = true; // 设置为false可切换回实际API

// 获取带认证的HTTP头
const getAuthHeader = () => {
  // 根据用户角色选择不同的令牌
  const userRole = localStorage.getItem('dify_user_role');
  let token;
  
  if (userRole === 'partner') {
    token = localStorage.getItem('dify_partner_token');
  } else {
    token = localStorage.getItem('dify_token');
  }
  
  return {
    headers: {
      Authorization: `Bearer ${token || ''}`
    }
  };
};

// 商机来源API
export const createLeadSource = (sourceData) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: createLeadSource', sourceData);
    // 模拟创建商机来源
    return mockLeadApi.getLeadSources().then(response => {
      const sources = response.data;
      const newId = String(sources.length + 1);
      const newSource = { id: newId, ...sourceData };
      return { data: newSource };
    });
  }
  return axios.post(`${config.apiBaseUrl}/leads/sources/`, sourceData, getAuthHeader());
};

export const getLeadSources = () => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: getLeadSources');
    return mockLeadApi.getLeadSources();
  }
  return axios.get(`${config.apiBaseUrl}/leads/sources/`, getAuthHeader());
};

export const updateLeadSource = (sourceId, sourceData) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: updateLeadSource', sourceId, sourceData);
    // 模拟更新商机来源
    return mockLeadApi.getLeadSources().then(response => {
      const sources = response.data;
      const index = sources.findIndex(s => s.id === sourceId);
      if (index >= 0) {
        const updatedSource = { ...sources[index], ...sourceData };
        return { data: updatedSource };
      }
      return Promise.reject(new Error('商机来源不存在'));
    });
  }
  return axios.put(`${config.apiBaseUrl}/leads/sources/${sourceId}`, sourceData, getAuthHeader());
};

// 商机状态API
export const createLeadStatus = (statusData) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: createLeadStatus', statusData);
    // 模拟创建商机状态
    return mockLeadApi.getLeadStatuses().then(response => {
      const statuses = response.data;
      const newId = String(statuses.length + 1);
      const newStatus = { id: newId, ...statusData };
      return { data: newStatus };
    });
  }
  return axios.post(`${config.apiBaseUrl}/leads/statuses/`, statusData, getAuthHeader());
};

export const getLeadStatuses = () => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: getLeadStatuses');
    return mockLeadApi.getLeadStatuses();
  }
  return axios.get(`${config.apiBaseUrl}/leads/statuses/`, getAuthHeader());
};

export const updateLeadStatus = (statusId, statusData) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: updateLeadStatus', statusId, statusData);
    // 模拟更新商机状态
    return mockLeadApi.getLeadStatuses().then(response => {
      const statuses = response.data;
      const index = statuses.findIndex(s => s.id === statusId);
      if (index >= 0) {
        const updatedStatus = { ...statuses[index], ...statusData };
        return { data: updatedStatus };
      }
      return Promise.reject(new Error('商机状态不存在'));
    });
  }
  return axios.put(`${config.apiBaseUrl}/leads/statuses/${statusId}`, statusData, getAuthHeader());
};

// 商机API
export const createLead = (leadData) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: createLead', leadData);
    return mockLeadApi.createLead(leadData);
  }
  return axios.post(`${config.apiBaseUrl}/leads/`, leadData, getAuthHeader());
};

export const getLeads = (params = {}) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: getLeads', params);
    return mockLeadApi.getLeads(params);
  }
  return axios.get(`${config.apiBaseUrl}/leads/`, {
    ...getAuthHeader(),
    params
  });
};

export const getLead = (leadId) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: getLead', leadId);
    return mockLeadApi.getLead(leadId);
  }
  return axios.get(`${config.apiBaseUrl}/leads/${leadId}`, getAuthHeader());
};

export const updateLead = (leadId, leadData) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: updateLead', leadId, leadData);
    return mockLeadApi.updateLead(leadId, leadData);
  }
  return axios.put(`${config.apiBaseUrl}/leads/${leadId}`, leadData, getAuthHeader());
};

export const updateLeadStatusOnly = (leadId, statusData) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: updateLeadStatusOnly', leadId, statusData);
    return mockLeadApi.updateLeadStatus(leadId, statusData.status_id);
  }
  return axios.patch(`${config.apiBaseUrl}/leads/${leadId}/status`, statusData, getAuthHeader());
};

export const deleteLead = (leadId) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: deleteLead', leadId);
    return mockLeadApi.deleteLead(leadId);
  }
  return axios.delete(`${config.apiBaseUrl}/leads/${leadId}`, getAuthHeader());
};

// 商机活动API
export const createLeadActivity = (leadId, activityData) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: createLeadActivity', leadId, activityData);
    // 模拟创建商机活动（简单返回，不实际存储）
    const newActivity = {
      id: Date.now().toString(),
      lead_id: leadId,
      ...activityData,
      created_at: new Date().toISOString()
    };
    return Promise.resolve({ data: newActivity });
  }
  return axios.post(`${config.apiBaseUrl}/leads/${leadId}/activities`, {
    ...activityData,
    lead_id: leadId
  }, getAuthHeader());
};

export const getLeadActivities = (leadId) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: getLeadActivities', leadId);
    // 模拟商机活动列表
    const mockActivities = [
      {
        id: '1',
        lead_id: leadId,
        type: '电话',
        description: '初步电话联系，客户对产品表示兴趣',
        created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString()
      },
      {
        id: '2',
        lead_id: leadId,
        type: '邮件',
        description: '发送产品介绍邮件和报价单',
        created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString()
      },
      {
        id: '3',
        lead_id: leadId,
        type: '会议',
        description: '线上演示会议，讲解产品功能',
        created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
      }
    ];
    return Promise.resolve({ data: mockActivities });
  }
  return axios.get(`${config.apiBaseUrl}/leads/${leadId}/activities`, getAuthHeader());
};

export const updateLeadActivity = (leadId, activityId, activityData) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: updateLeadActivity', leadId, activityId, activityData);
    // 模拟更新活动（简单返回更新后的数据）
    const updatedActivity = {
      id: activityId,
      lead_id: leadId,
      ...activityData,
      updated_at: new Date().toISOString()
    };
    return Promise.resolve({ data: updatedActivity });
  }
  return axios.put(`${config.apiBaseUrl}/leads/${leadId}/activities/${activityId}`, activityData, getAuthHeader());
};

export const deleteLeadActivity = (leadId, activityId) => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: deleteLeadActivity', leadId, activityId);
    // 模拟删除活动（简单返回成功）
    return Promise.resolve({ data: { success: true } });
  }
  return axios.delete(`${config.apiBaseUrl}/leads/${leadId}/activities/${activityId}`, getAuthHeader());
};

// 销售漏斗数据API
export const getLeadFunnelData = () => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: getLeadFunnelData');
    // 模拟销售漏斗数据
    return mockLeadApi.getLeads().then(response => {
      const allLeads = response.data;
      
      // 从模拟数据中统计各状态的商机数量和金额
      const funnelData = [
        { status_id: '1', status_name: '初步接触', count: 0, value: 0 },
        { status_id: '2', status_name: '需求确认', count: 0, value: 0 },
        { status_id: '3', status_name: '方案提供', count: 0, value: 0 },
        { status_id: '4', status_name: '商务谈判', count: 0, value: 0 },
        { status_id: '5', status_name: '已成交', count: 0, value: 0 },
        { status_id: '6', status_name: '已失败', count: 0, value: 0 }
      ];
      
      // 统计每个状态的商机数量和总金额
      allLeads.forEach(lead => {
        const statusIndex = funnelData.findIndex(item => item.status_id === lead.status_id);
        if (statusIndex >= 0) {
          funnelData[statusIndex].count += 1;
          funnelData[statusIndex].value += (lead.expected_value || 0);
        }
      });
      
      return { data: funnelData };
    });
  }
  return axios.get(`${config.apiBaseUrl}/leads/funnel`, getAuthHeader());
};

// 销售业绩数据API
export const getLeadPerformanceData = () => {
  if (USE_MOCK_DATA) {
    console.log('使用模拟数据: getLeadPerformanceData');
    return new Promise((resolve) => {
      // 模拟延迟
      setTimeout(() => {
        // 模拟销售业绩热力图数据
        // 数据结构为[{id, 'Jan', 'Feb', ...}]
        const performanceData = [
          {
            id: '张三',
            'Jan': 75000,
            'Feb': 120000,
            'Mar': 67000,
            'Apr': 89000,
            'May': 134000,
            'Jun': 112000,
          },
          {
            id: '李四',
            'Jan': 98000,
            'Feb': 85000,
            'Mar': 93000,
            'Apr': 142000,
            'May': 95000,
            'Jun': 88000,
          },
          {
            id: '王五',
            'Jan': 45000,
            'Feb': 63000,
            'Mar': 87000,
            'Apr': 91000,
            'May': 105000,
            'Jun': 118000,
          },
          {
            id: '赵六',
            'Jan': 105000,
            'Feb': 118000,
            'Mar': 96000,
            'Apr': 72000,
            'May': 84000,
            'Jun': 108000,
          },
          {
            id: '钱七',
            'Jan': 62000,
            'Feb': 71000,
            'Mar': 84000,
            'Apr': 99000,
            'May': 112000,
            'Jun': 127000,
          }
        ];
        resolve({ data: performanceData });
      }, 800);
    });
  }
  // 注意：此API端点不限制销售代表或工程师的访问权限
  // 与记忆中的权限设置一致，允许销售代表和工程师查看所有数据
  return axios.get(`${config.apiBaseUrl}/leads/performance`, getAuthHeader());
};
