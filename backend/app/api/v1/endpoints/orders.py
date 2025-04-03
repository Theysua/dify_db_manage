#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
订单API
处理PO单的接收、查询和审核
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api import deps
from app.api import deps_partner
from app.models.user_models import User
from app.models.partner_models import Partner
from app.models.order_models import PurchaseOrder
from app.services.order_service import OrderService
from app.schemas import order_schemas

router = APIRouter()

@router.post("/create", response_model=order_schemas.PurchaseOrderInfo)
def create_order(
    order_data: order_schemas.PurchaseOrderCreate,
    db: Session = Depends(get_db),
    partner: Partner = Depends(deps_partner.get_partner_by_uuid)
):
    """
    创建新的采购订单 (PO)
    
    此API供外部系统调用，创建新的PO单
    
    身份验证：
    - 需要在请求头中提供X-Partner-UUID
    """
    # 添加合作商信息到订单中
    source_details = order_data.source_details or {}
    source_details.update({
        "partner_id": partner.partner_id,
        "partner_name": partner.partner_name
    })
    order_data.source_details = source_details
    
    return OrderService.create_order(db, order_data)

@router.post("/manual-create", response_model=order_schemas.PurchaseOrderInfo)
def create_manual_order(
    order_data: order_schemas.PurchaseOrderManualCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_field_staff)
):
    """
    手动创建采购订单 (PO)
    
    供内部系统使用，手动录入PO单
    """
    # 转换为标准PO创建格式
    po_create_data = order_schemas.PurchaseOrderCreate(
        **order_data.dict(exclude={"order_source"}),
        order_source="MANUAL",
        source_details={"creator": "internal_staff"}
    )
    return OrderService.create_order(db, po_create_data)

@router.get("/{order_id}", response_model=order_schemas.PurchaseOrderInfo)
def get_order(
    order_id: int = Path(..., description="订单ID"),
    db: Session = Depends(get_db)
):
    """
    获取订单详情
    """
    return OrderService.get_order(db, order_id)

@router.get("/by-po-number/{po_number}", response_model=order_schemas.PurchaseOrderInfo)
def get_order_by_po_number(
    po_number: str = Path(..., description="采购订单号"),
    db: Session = Depends(get_db)
):
    """
    根据PO编号获取订单详情
    """
    return OrderService.get_order_by_po_number(db, po_number)

@router.get("/", response_model=order_schemas.PurchaseOrderList)
def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    po_number: Optional[str] = Query(None, description="采购订单号"),
    customer_id: Optional[int] = Query(None, description="客户ID"),
    customer_name: Optional[str] = Query(None, description="客户名称"),
    order_status: Optional[order_schemas.OrderStatusEnum] = Query(None, description="订单状态"),
    order_source: Optional[order_schemas.OrderSourceEnum] = Query(None, description="订单来源"),
    db: Session = Depends(get_db)
):
    """
    获取订单列表，支持分页和过滤
    """
    orders = OrderService.get_orders(
        db, skip, limit, po_number, customer_id, customer_name, 
        order_status.value if order_status else None,
        order_source.value if order_source else None
    )
    return orders

@router.post("/{order_id}/update-status", response_model=order_schemas.PurchaseOrderInfo)
def update_order_status(
    status_data: order_schemas.PurchaseOrderStatusUpdate = Body(...),
    order_id: int = Path(..., description="订单ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    更新订单状态（审核）
    
    权限：
    - 管理员：只有管理员可以审核订单
    """
    return OrderService.update_order_status(
        db, order_id, status_data, current_user.username
    )
