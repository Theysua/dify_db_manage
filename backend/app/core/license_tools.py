#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
许可证激活工具
提供在线/离线许可证激活相关功能
"""

import os
import time
import json
import hashlib
import base64
import hmac
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple

# 安全密钥，实际应用中应从环境变量或安全存储获取
LICENSE_SECRET_KEY = os.environ.get("LICENSE_SECRET_KEY", "dify_license_secret_key_2025")

def generate_online_license(license_data: Dict[str, Any]) -> str:
    """
    生成在线激活的许可证密钥
    这是一个模拟函数，实际应用中通常连接到许可证服务器
    
    Args:
        license_data: 许可证数据
        
    Returns:
        str: 许可证密钥
    """
    # 模拟在线许可证服务器响应
    timestamp = int(time.time())
    license_key = f"DIFY-ONLINE-{license_data['license_id']}-{timestamp}"
    
    # 在实际系统中，这里会包含更多验证和许可证服务器交互
    return license_key

def generate_offline_license(license_data: Dict[str, Any], cluster_id: str) -> str:
    """
    基于许可证数据和集群ID生成离线激活码
    
    Args:
        license_data: 许可证数据
        cluster_id: 客户端集群ID
        
    Returns:
        str: 加密的离线激活码
    """
    if not cluster_id:
        raise ValueError("离线激活需要提供有效的Cluster ID")
    
    # 构建包含所有重要许可证信息的数据负载
    payload = {
        "license_id": license_data["license_id"],
        "customer_id": license_data["customer_id"],
        "product_name": license_data["product_name"],
        "license_type": license_data["license_type"],
        "start_date": license_data["start_date"].isoformat() if isinstance(license_data["start_date"], datetime) else license_data["start_date"],
        "expiry_date": license_data["expiry_date"].isoformat() if isinstance(license_data["expiry_date"], datetime) else license_data["expiry_date"],
        "authorized_workspaces": license_data["authorized_workspaces"],
        "authorized_users": license_data["authorized_users"],
        "cluster_id": cluster_id,
        "generated_at": datetime.now().isoformat(),
        "nonce": str(uuid.uuid4())
    }
    
    # 转换为JSON字符串
    payload_json = json.dumps(payload, sort_keys=True)
    
    # 使用HMAC-SHA256对数据进行签名
    signature = hmac.new(
        LICENSE_SECRET_KEY.encode('utf-8'),
        payload_json.encode('utf-8'),
        hashlib.sha256
    ).digest()
    
    # 对JSON数据进行Base64编码
    payload_base64 = base64.b64encode(payload_json.encode('utf-8')).decode('utf-8')
    
    # 对签名进行Base64编码
    signature_base64 = base64.b64encode(signature).decode('utf-8')
    
    # 组合成最终的离线激活码
    offline_code = f"{payload_base64}.{signature_base64}"
    
    return offline_code

def verify_offline_license(offline_code: str, cluster_id: str) -> Tuple[bool, Dict[str, Any]]:
    """
    验证离线激活码是否有效
    
    Args:
        offline_code: 离线激活码
        cluster_id: 当前集群ID
        
    Returns:
        Tuple[bool, dict]: (是否有效, 许可证数据)
    """
    try:
        # 分离负载和签名
        parts = offline_code.split('.')
        if len(parts) != 2:
            return False, {"error": "无效的激活码格式"}
        
        payload_base64, signature_base64 = parts
        
        # 解码负载
        payload_json = base64.b64decode(payload_base64).decode('utf-8')
        payload = json.loads(payload_json)
        
        # 验证集群ID
        if payload.get("cluster_id") != cluster_id:
            return False, {"error": "激活码与当前集群不匹配"}
        
        # 验证签名
        expected_signature = hmac.new(
            LICENSE_SECRET_KEY.encode('utf-8'),
            payload_json.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        actual_signature = base64.b64decode(signature_base64)
        
        if not hmac.compare_digest(expected_signature, actual_signature):
            return False, {"error": "激活码签名验证失败"}
        
        # 验证许可证是否过期
        expiry_date = datetime.fromisoformat(payload["expiry_date"])
        if expiry_date < datetime.now():
            return False, {"error": "许可证已过期"}
        
        return True, payload
        
    except Exception as e:
        return False, {"error": f"验证失败: {str(e)}"}

def log_activation_change(license_data: Dict[str, Any], 
                          from_mode: str, 
                          to_mode: str, 
                          cluster_id: Optional[str] = None) -> Dict[str, Any]:
    """
    记录激活方式变更历史
    
    Args:
        license_data: 许可证数据
        from_mode: 原激活方式
        to_mode: 新激活方式
        cluster_id: 集群ID（离线模式时需要）
        
    Returns:
        dict: 更新后的激活历史记录
    """
    # 获取现有历史记录或初始化
    history = license_data.get("activation_history", {})
    if not history:
        history = {"changes": []}
    
    # 添加新的变更记录
    change_record = {
        "timestamp": datetime.now().isoformat(),
        "from_mode": from_mode,
        "to_mode": to_mode,
        "cluster_id": cluster_id if to_mode == "OFFLINE" else None
    }
    
    if "changes" not in history:
        history["changes"] = []
    
    history["changes"].append(change_record)
    
    return history
