#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
合作商身份识别相关的Schema
"""

from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime


# 基础身份识别Schema
class PartnerIdentityBase(BaseModel):
    description: Optional[str] = Field(None, description="身份描述")
    is_active: bool = Field(True, description="是否启用")


# 创建身份识别Schema
class PartnerIdentityCreate(PartnerIdentityBase):
    partner_id: int = Field(..., description="合作商ID")


# 更新身份识别Schema
class PartnerIdentityUpdate(PartnerIdentityBase):
    pass


# 身份识别信息响应Schema
class PartnerIdentityInfo(PartnerIdentityBase):
    identity_id: int
    partner_id: int
    api_uuid: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True


# 身份识别详细信息（包含邮箱映射）
class PartnerIdentityDetail(PartnerIdentityInfo):
    partner_name: str
    email_mappings: List["PartnerEmailMappingInfo"] = []


# 基础邮箱映射Schema
class PartnerEmailMappingBase(BaseModel):
    email_address: EmailStr = Field(..., description="邮箱地址")
    description: Optional[str] = Field(None, description="描述")


# 创建邮箱映射Schema
class PartnerEmailMappingCreate(PartnerEmailMappingBase):
    identity_id: int = Field(..., description="身份识别ID")


# 邮箱映射信息响应Schema
class PartnerEmailMappingInfo(PartnerEmailMappingBase):
    mapping_id: int
    identity_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True


# 更新模型中的循环引用
PartnerIdentityDetail.update_forward_refs()


# API安全认证请求头Schema（用于验证UUID）
class PartnerApiAuth(BaseModel):
    partner_uuid: str = Field(..., description="合作商API UUID")
