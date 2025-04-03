#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
许可证激活相关的API请求和响应模型
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, date
from pydantic import BaseModel, Field, validator

class LicenseActivationRequest(BaseModel):
    """许可证激活模式变更请求"""
    activation_mode: str = Field(..., description="激活模式: ONLINE或OFFLINE")
    cluster_id: Optional[str] = Field(None, description="集群ID (离线激活时必须提供)")
    from_mode: Optional[str] = Field(None, description="当前激活模式")
    reason: Optional[str] = Field(None, description="变更理由")
    
    @validator('activation_mode')
    def validate_activation_mode(cls, v):
        if v not in ['ONLINE', 'OFFLINE']:
            raise ValueError('激活模式必须是ONLINE或OFFLINE')
        return v
    
    @validator('cluster_id')
    def validate_cluster_id(cls, v, values):
        if values.get('activation_mode') == 'OFFLINE' and not v:
            raise ValueError('离线激活模式必须提供集群ID')
        return v

class OfflineActivationRequest(BaseModel):
    """离线激活请求"""
    cluster_id: str = Field(..., description="集群ID")
    reason: Optional[str] = Field(None, description="重新生成激活码的理由")

class LicenseActivationResponse(BaseModel):
    """许可证激活响应"""
    license_id: str
    activation_mode: str
    message: str
    offline_code: Optional[str] = None
    cluster_id: Optional[str] = None

class LicenseInfo(BaseModel):
    """许可证激活信息"""
    license_id: str
    activation_mode: str
    cluster_id: Optional[str] = None
    offline_code: Optional[str] = None
    last_activation_change: Optional[datetime] = None
    activation_history: Optional[Dict[str, Any]] = None
    license_status: str
    expiry_date: date

    class Config:
        orm_mode = True
