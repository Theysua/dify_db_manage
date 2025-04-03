#!/usr/bin/env python
# -*- coding: utf-8 -*-

from typing import Optional, List, Dict, Any
from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel, Field, validator

# 定义状态枚举
class OrderStatusEnum(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    
class OrderSourceEnum(str, Enum):
    API = "API"
    MANUAL = "MANUAL"
    PARTNER = "PARTNER"
    
class ActivationModeEnum(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"

# 创建PO单基础模型
class PurchaseOrderBase(BaseModel):
    po_number: str = Field(..., description="采购订单号")
    customer_name: str = Field(..., description="客户名称")
    contact_person: Optional[str] = Field(None, description="联系人")
    contact_email: Optional[str] = Field(None, description="联系邮箱")
    contact_phone: Optional[str] = Field(None, description="联系电话")
    
    product_name: str = Field(..., description="产品名称")
    product_version: Optional[str] = Field(None, description="产品版本")
    license_type: str = Field(..., description="许可证类型")
    quantity: int = Field(1, description="数量")
    amount: float = Field(..., description="金额")
    currency: str = Field("USD", description="货币")
    
    authorized_workspaces: int = Field(0, description="授权工作区数量")
    authorized_users: int = Field(0, description="授权用户数量")
    
    order_date: date = Field(..., description="订单日期")
    activation_mode: ActivationModeEnum = Field(ActivationModeEnum.ONLINE, description="激活模式")
    cluster_id: Optional[str] = Field(None, description="集群ID（离线模式需要）")

# API创建订单模型
class PurchaseOrderCreate(PurchaseOrderBase):
    customer_id: Optional[int] = Field(None, description="客户ID（如果已有客户）")
    order_source: OrderSourceEnum = Field(OrderSourceEnum.API, description="订单来源")
    source_details: Optional[Dict[str, Any]] = Field(None, description="来源详情")

# 手动创建订单模型
class PurchaseOrderManualCreate(PurchaseOrderBase):
    customer_id: int = Field(..., description="客户ID")
    order_source: OrderSourceEnum = Field(OrderSourceEnum.MANUAL, description="订单来源")

# 更新订单状态模型
class PurchaseOrderStatusUpdate(BaseModel):
    order_status: OrderStatusEnum = Field(..., description="订单状态")
    review_notes: Optional[str] = Field(None, description="审核备注")
    reviewed_by: Optional[str] = Field(None, description="审核人")

# 订单信息响应模型
class PurchaseOrderInfo(PurchaseOrderBase):
    order_id: int
    customer_id: Optional[int]
    order_status: OrderStatusEnum
    review_notes: Optional[str]
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]
    license_id: Optional[str]
    order_source: OrderSourceEnum
    source_details: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# 订单列表查询参数
class PurchaseOrderQueryParams(BaseModel):
    skip: int = Field(0, description="跳过的记录数")
    limit: int = Field(10, description="返回的记录数")
    po_number: Optional[str] = Field(None, description="采购订单号")
    customer_id: Optional[int] = Field(None, description="客户ID")
    customer_name: Optional[str] = Field(None, description="客户名称")
    order_status: Optional[OrderStatusEnum] = Field(None, description="订单状态")
    order_source: Optional[OrderSourceEnum] = Field(None, description="订单来源")
    
# 订单列表响应
class PurchaseOrderList(BaseModel):
    total: int
    items: List[PurchaseOrderInfo]
    
    class Config:
        orm_mode = True
