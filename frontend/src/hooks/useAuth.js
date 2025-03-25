import { useState, useEffect } from 'react';

/**
 * 用户认证hooks
 * 提供用户登录状态和角色信息
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查当前用户角色
    const userRole = localStorage.getItem('dify_user_role');
    let userData = null;
    
    // 基于用户角色选择数据来源
    if (userRole === 'partner') {
      // 合作伙伴用户
      const partnerInfo = localStorage.getItem('dify_partner_info');
      if (partnerInfo) {
        try {
          userData = JSON.parse(partnerInfo);
          userData.role = 'partner';
          userData.roles = ['partner'];
          userData.access_token = localStorage.getItem('dify_partner_token');
        } catch (error) {
          console.error('Failed to parse partner data', error);
        }
      }
    } else {
      // 管理员、销售、工程师用户
      const userInfo = localStorage.getItem('dify_user_info');
      if (userInfo) {
        try {
          userData = JSON.parse(userInfo);
          // 确保用户对象具有必要的角色属性
          if (!userData.roles && userData.Role) {
            userData.roles = [userData.Role];
            userData.role = userData.Role;
          } else if (!userData.roles && !userData.Role) {
            userData.roles = [];
            userData.role = null;
          }
          userData.access_token = localStorage.getItem('dify_token');
        } catch (error) {
          console.error('Failed to parse user data', error);
        }
      }
    }
    
    // 如果没有用户数据，设置默认用户对象
    if (!userData) {
      userData = { roles: [], role: null, access_token: null };
    }
    
    setUser(userData);
    setLoading(false);
  }, []);

  // 检查用户是否已登录
  const isAuthenticated = !!user?.access_token;

  // 检查用户角色权限（增强版）
  const hasRole = (role) => {
    if (!user) return false;
    
    // 首先检查用户对象中的roles数组
    if (user.roles && Array.isArray(user.roles)) {
      if (user.roles.includes(role)) return true;
    }
    
    // 然后检查用户对象中的role字段
    if (user.role === role) return true;
    if (user.Role === role) return true;
    
    // 最后检查localStorage中的角色值
    const storedRole = localStorage.getItem('dify_user_role');
    if (storedRole === role) return true;
    
    // 输出调试信息
    console.log(`检查角色权限 [${role}]：`, {
      '用户对象': user,
      'localStorage角色': storedRole,
      '结果': false
    });
    
    return false;
  };

  // 检查是否为管理员（增强版）
  const isAdmin = () => {
    const result = hasRole('admin');
    // 如果结果为false，添加强制检查localStorage
    if (!result) {
      // 直接检查localStorage
      const directCheck = localStorage.getItem('dify_user_role') === 'admin';
      console.log('管理员权限检查：', directCheck ? '✅ 通过localStorage确认为管理员' : '❌ 非管理员');
      return directCheck;
    }
    return result;
  };

  // 检查是否为销售代表
  const isSalesRep = () => hasRole('sales_rep');

  // 检查是否为工程师
  const isEngineer = () => hasRole('engineer');

  // 检查是否为合作伙伴
  const isPartner = () => hasRole('partner');

  // 检查是否为销售或合作伙伴（现场人员）
  const isFieldStaff = () => isSalesRep() || isPartner();

  // 获取当前用户ID
  const getUserId = () => user?.id || null;

  // 获取当前用户所属的销售代表ID (如果用户是销售代表)
  const getSalesRepId = () => {
    if (isSalesRep()) {
      // 新的用户信息格式下可能的路径
      if (user?.sales_rep_id) return user.sales_rep_id;
      if (user?.SalesRepId) return user.SalesRepId;
      if (user?.profile?.sales_rep_id) return user.profile.sales_rep_id;
    }
    return null;
  };

  // 获取当前用户所属的合作伙伴ID (如果用户是合作伙伴)
  const getPartnerId = () => {
    if (isPartner()) {
      // 兼容不同数据格式
      if (user?.partner_id) return user.partner_id;
      if (user?.PartnerId) return user.PartnerId;
      if (user?.profile?.partner_id) return user.profile.partner_id;
    }
    return null;
  };

  return {
    user,
    loading,
    isAuthenticated,
    hasRole,
    isAdmin,
    isSalesRep,
    isEngineer,
    isPartner,
    isFieldStaff,
    getUserId,
    getSalesRepId,
    getPartnerId
  };
};

export default useAuth;
