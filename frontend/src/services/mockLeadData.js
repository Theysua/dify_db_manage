/**
 * 商机模拟数据
 * 用于前端开发和测试
 */

import { v4 as uuidv4 } from 'uuid';

// 模拟商机来源数据
export const mockLeadSources = [
  { id: '1', name: '网络搜索', description: '客户通过网络搜索找到我们' },
  { id: '2', name: '线下推荐', description: '客户通过现有客户推荐' },
  { id: '3', name: '社交媒体', description: '客户通过社交媒体平台找到我们' },
  { id: '4', name: '行业展会', description: '在行业展会上结识的潜在客户' },
  { id: '5', name: '电话营销', description: '通过电话营销获取的潜在客户' }
];

// 模拟商机状态数据
export const mockLeadStatuses = [
  { id: '1', name: '初步接触', description: '初步联系阶段', order: 1 },
  { id: '2', name: '需求确认', description: '确认客户需求阶段', order: 2 },
  { id: '3', name: '方案提供', description: '为客户提供解决方案', order: 3 },
  { id: '4', name: '商务谈判', description: '商务条款协商阶段', order: 4 },
  { id: '5', name: '已成交', description: '已完成销售', order: 5 },
  { id: '6', name: '已失败', description: '商机已失败', order: 6 }
];

// 模拟销售代表数据
export const mockSalesReps = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', phone: '13800001111' },
  { id: '2', name: '李四', email: 'lisi@example.com', phone: '13800002222' },
  { id: '3', name: '王五', email: 'wangwu@example.com', phone: '13800003333' }
];

// 模拟合作伙伴数据
export const mockPartners = [
  { id: '1', name: '数字科技有限公司', contact_person: '赵六', email: 'partner1@example.com' },
  { id: '2', name: '智能系统集成商', contact_person: '钱七', email: 'partner2@example.com' },
  { id: '3', name: '云服务提供商', contact_person: '孙八', email: 'partner3@example.com' }
];

// 模拟客户公司数据
export const mockCompanies = [
  { id: '1', name: '未来科技有限公司', industry: '人工智能', size: '中型企业' },
  { id: '2', name: '全球数据集团', industry: '大数据', size: '大型企业' },
  { id: '3', name: '智慧城市建设公司', industry: '智能城市', size: '大型企业' },
  { id: '4', name: '医疗科技创新公司', industry: '医疗健康', size: '初创企业' },
  { id: '5', name: '金融科技服务商', industry: '金融科技', size: '中型企业' },
  { id: '6', name: '教育在线平台', industry: '教育科技', size: '小型企业' },
  { id: '7', name: '绿色能源解决方案', industry: '清洁能源', size: '中型企业' },
  { id: '8', name: '物流优化系统', industry: '物流科技', size: '小型企业' },
  { id: '9', name: '零售数字化转型', industry: '零售科技', size: '大型企业' },
  { id: '10', name: '智能家居系统', industry: '物联网', size: '初创企业' }
];

// 生成随机日期函数
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// 生成模拟商机数据
export const generateMockLeads = (count = 50) => {
  const leads = [];
  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);

  for (let i = 0; i < count; i++) {
    const statusId = mockLeadStatuses[Math.floor(Math.random() * mockLeadStatuses.length)].id;
    const isSuccessful = statusId === '5'; // 已成交
    const isFailed = statusId === '6'; // 已失败
    
    // 根据状态决定商机阶段的日期设置
    let contactDate = randomDate(sixMonthsAgo, today);
    let qualificationDate = statusId >= '2' ? randomDate(contactDate, today) : null;
    let proposalDate = statusId >= '3' ? randomDate(qualificationDate || contactDate, today) : null;
    let negotiationDate = statusId >= '4' ? randomDate(proposalDate || contactDate, today) : null;
    let closedDate = (isSuccessful || isFailed) ? randomDate(negotiationDate || contactDate, today) : null;
    
    // 根据状态计算预期成交金额和概率
    let probability = 0;
    switch(statusId) {
      case '1': probability = Math.floor(Math.random() * 20) + 10; break; // 10-30%
      case '2': probability = Math.floor(Math.random() * 20) + 30; break; // 30-50%
      case '3': probability = Math.floor(Math.random() * 20) + 50; break; // 50-70%
      case '4': probability = Math.floor(Math.random() * 30) + 70; break; // 70-100%
      case '5': probability = 100; break; // 已成交
      case '6': probability = 0; break; // 已失败
    }
    
    // 预期成交金额 (5000-100000)
    const expectedValue = Math.floor(Math.random() * 95000) + 5000;
    
    // 实际成交金额 (只有已成交的商机才有)
    const actualValue = isSuccessful ? 
      Math.floor(expectedValue * (0.8 + Math.random() * 0.4)) : // 80-120% 的预期金额
      null;
    
    // 创建商机对象
    const lead = {
      id: uuidv4(),
      name: `${mockCompanies[Math.floor(Math.random() * mockCompanies.length)].name}的Dify许可需求`,
      company_name: mockCompanies[Math.floor(Math.random() * mockCompanies.length)].name,
      contact_name: ['张总', '李经理', '王董事', '赵主管', '钱总监'][Math.floor(Math.random() * 5)],
      contact_title: ['CEO', 'CTO', '技术总监', '项目经理', '采购经理'][Math.floor(Math.random() * 5)],
      contact_email: `contact${i}@example.com`,
      contact_phone: `138${String(Math.floor(10000000 + Math.random() * 90000000)).substring(0, 8)}`,
      description: `客户对Dify ${['企业版', '专业版', '定制版'][Math.floor(Math.random() * 3)]}有兴趣，需要${Math.floor(Math.random() * 10) + 1}个许可证。`,
      source_id: mockLeadSources[Math.floor(Math.random() * mockLeadSources.length)].id,
      status_id: statusId,
      sales_rep_id: mockSalesReps[Math.floor(Math.random() * mockSalesReps.length)].id,
      partner_id: Math.random() > 0.7 ? mockPartners[Math.floor(Math.random() * mockPartners.length)].id : null,
      
      expected_value: expectedValue,
      actual_value: actualValue,
      probability: probability,
      
      // 商机阶段的日期
      contact_date: contactDate.toISOString(),
      qualification_date: qualificationDate ? qualificationDate.toISOString() : null,
      proposal_date: proposalDate ? proposalDate.toISOString() : null,
      negotiation_date: negotiationDate ? negotiationDate.toISOString() : null,
      closed_date: closedDate ? closedDate.toISOString() : null,
      
      // 附加信息
      notes: [
        '客户对AI应用开发平台很感兴趣',
        '客户要求定制部署方案',
        '客户关注数据安全和隐私保护',
        '客户希望获得技术支持服务',
        '客户计划在一个月内做决定'
      ][Math.floor(Math.random() * 5)],
      
      created_at: contactDate.toISOString(),
      updated_at: randomDate(contactDate, today).toISOString()
    };
    
    leads.push(lead);
  }
  
  return leads;
};

// 默认导出50条模拟商机数据
export const mockLeads = generateMockLeads(50);

// 模拟商机API接口
export const mockLeadApi = {
  // 获取商机列表
  getLeads: (params = {}) => {
    // 处理筛选
    let filteredLeads = [...mockLeads];
    
    // 搜索
    if (params.search) {
      const searchText = params.search.toLowerCase();
      filteredLeads = filteredLeads.filter(lead => 
        lead.name.toLowerCase().includes(searchText) ||
        lead.company_name.toLowerCase().includes(searchText) ||
        lead.contact_name.toLowerCase().includes(searchText) ||
        lead.contact_email.toLowerCase().includes(searchText)
      );
    }
    
    // 按状态筛选
    if (params.status_id) {
      filteredLeads = filteredLeads.filter(lead => lead.status_id === params.status_id);
    }
    
    // 按销售代表筛选
    if (params.sales_rep_id) {
      filteredLeads = filteredLeads.filter(lead => lead.sales_rep_id === params.sales_rep_id);
    }
    
    // 按合作伙伴筛选
    if (params.partner_id) {
      filteredLeads = filteredLeads.filter(lead => lead.partner_id === params.partner_id);
    }
    
    // 按来源筛选
    if (params.source_id) {
      filteredLeads = filteredLeads.filter(lead => lead.source_id === params.source_id);
    }
    
    // 计算总数
    const total = filteredLeads.length;
    
    // 处理分页
    const skip = params.skip || 0;
    const limit = params.limit || 10;
    
    // 为每条记录添加关联对象（状态、来源、销售代表等）
    const enrichedLeads = filteredLeads.map(lead => {
      // 查找并添加状态对象
      const status = mockLeadStatuses.find(s => s.id === lead.status_id);
      
      // 查找并添加来源对象
      const source = mockLeadSources.find(s => s.id === lead.source_id);
      
      // 查找并添加销售代表对象
      const salesRep = mockSalesReps.find(s => s.id === lead.sales_rep_id);
      
      // 查找并添加合作伙伴对象（如果有）
      const partner = lead.partner_id ? 
        mockPartners.find(p => p.id === lead.partner_id) : 
        null;
      
      // 转换字段名以匹配前端组件预期
      return {
        lead_id: lead.id,
        lead_name: lead.name,
        company_name: lead.company_name,
        contact_person: lead.contact_name,
        contact_email: lead.contact_email,
        contact_phone: lead.contact_phone,
        description: lead.description,
        
        // 将关联ID转换为完整对象
        status: status ? {
          status_id: status.id,
          status_name: status.name
        } : { status_id: lead.status_id, status_name: '未知状态' },
        
        source: source ? {
          source_id: source.id,
          source_name: source.name
        } : null,
        
        sales_rep: salesRep ? {
          sales_rep_id: salesRep.id,
          sales_rep_name: salesRep.name
        } : null,
        
        partner: partner ? {
          partner_id: partner.id,
          partner_name: partner.name
        } : null,
        
        // 金额相关字段
        estimated_value: lead.expected_value,
        actual_value: lead.actual_value,
        probability: lead.probability,
        currency: 'CNY', // 默认币种
        
        // 日期字段
        expected_close_date: lead.closed_date || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        
        // 原始数据也保留，以防需要
        _original: lead
      };
    });
    
    // 应用分页
    const paginatedLeads = enrichedLeads.slice(skip, skip + limit);
    
    // 模拟API响应
    return Promise.resolve({
      data: paginatedLeads,
      headers: {
        'x-total-count': total
      }
    });
  },
  
  // 获取单个商机
  getLead: (id) => {
    const lead = mockLeads.find(lead => lead.id === id);
    
    if (!lead) {
      return Promise.reject(new Error('商机不存在'));
    }
    
    // 查找并添加状态对象
    const status = mockLeadStatuses.find(s => s.id === lead.status_id);
    
    // 查找并添加来源对象
    const source = mockLeadSources.find(s => s.id === lead.source_id);
    
    // 查找并添加销售代表对象
    const salesRep = mockSalesReps.find(s => s.id === lead.sales_rep_id);
    
    // 查找并添加合作伙伴对象（如果有）
    const partner = lead.partner_id ? 
      mockPartners.find(p => p.id === lead.partner_id) : 
      null;
    
    // 转换为前端组件期望的格式
    const enrichedLead = {
      lead_id: lead.id,
      lead_name: lead.name,
      company_name: lead.company_name,
      contact_person: lead.contact_name,
      contact_email: lead.contact_email,
      contact_phone: lead.contact_phone,
      description: lead.description,
      notes: lead.notes,
      
      // 将关联ID转换为完整对象
      status: status ? {
        status_id: status.id,
        status_name: status.name
      } : { status_id: lead.status_id, status_name: '未知状态' },
      
      status_id: lead.status_id, // 保留原始 ID 以便状态选择器使用
      
      source: source ? {
        source_id: source.id,
        source_name: source.name
      } : null,
      
      sales_rep: salesRep ? {
        sales_rep_id: salesRep.id,
        sales_rep_name: salesRep.name
      } : null,
      
      partner: partner ? {
        partner_id: partner.id,
        partner_name: partner.name
      } : null,
      
      // 金额相关字段
      estimated_value: lead.expected_value,
      actual_value: lead.actual_value,
      probability: lead.probability,
      currency: 'CNY', // 默认币种
      
      // 日期字段
      expected_close_date: lead.closed_date || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      
      // 附加信息
      industry: lead.industry || '电子科技',
      region: lead.region || '华北区',
      product_interest: lead.product_interest || 'Dify 企业版'
    };
    
    return Promise.resolve({
      data: enrichedLead
    });
  },
  
  // 创建商机
  createLead: (leadData) => {
    const newLead = {
      ...leadData,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockLeads.push(newLead);
    return Promise.resolve({
      data: newLead
    });
  },
  
  // 更新商机
  updateLead: (id, leadData) => {
    const index = mockLeads.findIndex(lead => lead.id === id);
    if (index === -1) {
      return Promise.reject(new Error('商机不存在'));
    }
    
    const updatedLead = {
      ...mockLeads[index],
      ...leadData,
      updated_at: new Date().toISOString()
    };
    
    mockLeads[index] = updatedLead;
    return Promise.resolve({
      data: updatedLead
    });
  },
  
  // 删除商机
  deleteLead: (id) => {
    const index = mockLeads.findIndex(lead => lead.id === id);
    if (index === -1) {
      return Promise.reject(new Error('商机不存在'));
    }
    
    const deletedLead = mockLeads.splice(index, 1)[0];
    return Promise.resolve({
      data: deletedLead
    });
  },
  
  // 获取商机状态
  getLeadStatuses: () => {
    return Promise.resolve({
      data: mockLeadStatuses
    });
  },
  
  // 获取商机来源
  getLeadSources: () => {
    return Promise.resolve({
      data: mockLeadSources
    });
  },
  
  // 更新商机状态
  updateLeadStatus: (id, statusId) => {
    const index = mockLeads.findIndex(lead => lead.id === id);
    if (index === -1) {
      return Promise.reject(new Error('商机不存在'));
    }
    
    // 获取当前状态和新状态
    const currentStatus = mockLeadStatuses.find(s => s.id === mockLeads[index].status_id);
    const newStatus = mockLeadStatuses.find(s => s.id === statusId);
    
    // 如果是向前推进
    if (newStatus.order > currentStatus.order) {
      // 根据新状态更新对应的日期
      const updates = {};
      
      if (newStatus.id === '2' && !mockLeads[index].qualification_date) {
        updates.qualification_date = new Date().toISOString();
      } else if (newStatus.id === '3' && !mockLeads[index].proposal_date) {
        updates.proposal_date = new Date().toISOString();
      } else if (newStatus.id === '4' && !mockLeads[index].negotiation_date) {
        updates.negotiation_date = new Date().toISOString();
      } else if ((newStatus.id === '5' || newStatus.id === '6') && !mockLeads[index].closed_date) {
        updates.closed_date = new Date().toISOString();
        
        // 如果是成交，设置实际成交金额
        if (newStatus.id === '5') {
          updates.actual_value = Math.floor(mockLeads[index].expected_value * (0.8 + Math.random() * 0.4));
          updates.probability = 100;
        } else if (newStatus.id === '6') {
          updates.probability = 0;
        }
      }
      
      // 更新商机
      mockLeads[index] = {
        ...mockLeads[index],
        ...updates,
        status_id: statusId,
        updated_at: new Date().toISOString()
      };
    } else {
      // 简单更新状态
      mockLeads[index].status_id = statusId;
      mockLeads[index].updated_at = new Date().toISOString();
      
      // 调整概率
      switch(statusId) {
        case '1': mockLeads[index].probability = Math.floor(Math.random() * 20) + 10; break;
        case '2': mockLeads[index].probability = Math.floor(Math.random() * 20) + 30; break;
        case '3': mockLeads[index].probability = Math.floor(Math.random() * 20) + 50; break;
        case '4': mockLeads[index].probability = Math.floor(Math.random() * 30) + 70; break;
        case '5': mockLeads[index].probability = 100; break;
        case '6': mockLeads[index].probability = 0; break;
      }
    }
    
    return Promise.resolve({
      data: mockLeads[index]
    });
  }
};
