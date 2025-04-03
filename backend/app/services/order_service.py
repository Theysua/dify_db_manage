#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
订单服务
处理PO单接收、审核和许可证生成
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.order_models import PurchaseOrder
from app.models.models import Customer, License
from app.services.license_service import LicenseService
from app.schemas import order_schemas

class OrderService:
    """订单服务类，处理PO单的创建、审核和许可证生成"""
    
    @staticmethod
    def create_order(db: Session, order_data: order_schemas.PurchaseOrderCreate) -> PurchaseOrder:
        """创建新的PO单"""
        # 检查PO编号是否唯一
        existing_po = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == order_data.po_number).first()
        if existing_po:
            raise HTTPException(status_code=400, detail=f"采购订单号'{order_data.po_number}'已存在")
        
        # 如果提供了客户ID，验证客户是否存在
        customer = None
        if order_data.customer_id:
            customer = db.query(Customer).filter(Customer.customer_id == order_data.customer_id).first()
            if not customer:
                raise HTTPException(status_code=404, detail=f"客户ID '{order_data.customer_id}' 不存在")
        
        # 创建PO单对象
        order_dict = order_data.dict()
        
        # 创建并保存新的PO单
        new_order = PurchaseOrder(**order_dict)
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        return new_order
    
    @staticmethod
    def get_order(db: Session, order_id: int) -> PurchaseOrder:
        """获取PO单详情"""
        order = db.query(PurchaseOrder).filter(PurchaseOrder.order_id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail=f"订单ID '{order_id}' 不存在")
        return order
    
    @staticmethod
    def get_order_by_po_number(db: Session, po_number: str) -> PurchaseOrder:
        """根据PO编号获取PO单详情"""
        order = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_number).first()
        if not order:
            raise HTTPException(status_code=404, detail=f"采购订单号 '{po_number}' 不存在")
        return order
    
    @staticmethod
    def get_orders(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        po_number: Optional[str] = None,
        customer_id: Optional[int] = None,
        customer_name: Optional[str] = None,
        order_status: Optional[str] = None,
        order_source: Optional[str] = None
    ) -> Dict[str, Any]:
        """获取PO单列表"""
        # 构建查询
        query = db.query(PurchaseOrder)
        
        # 应用过滤条件
        if po_number:
            query = query.filter(PurchaseOrder.po_number.ilike(f"%{po_number}%"))
        if customer_id:
            query = query.filter(PurchaseOrder.customer_id == customer_id)
        if customer_name:
            query = query.filter(PurchaseOrder.customer_name.ilike(f"%{customer_name}%"))
        if order_status:
            query = query.filter(PurchaseOrder.order_status == order_status)
        if order_source:
            query = query.filter(PurchaseOrder.order_source == order_source)
        
        # 计算总数
        total = query.count()
        
        # 分页
        orders = query.order_by(PurchaseOrder.created_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "items": orders
        }
    
    @staticmethod
    def update_order_status(
        db: Session, 
        order_id: int, 
        status_data: order_schemas.PurchaseOrderStatusUpdate,
        current_user: str
    ) -> PurchaseOrder:
        """更新PO单状态（审核）"""
        # 获取订单
        order = OrderService.get_order(db, order_id)
        
        # 已完成的订单不能再修改状态
        if order.order_status == "COMPLETED":
            raise HTTPException(status_code=400, detail="已完成的订单不能再修改状态")
        
        # 更新状态
        order.order_status = status_data.order_status
        order.review_notes = status_data.review_notes
        order.reviewed_by = current_user
        order.reviewed_at = datetime.now()
        
        # 如果状态为"已批准"，则生成许可证
        if status_data.order_status == "APPROVED" and not order.license_id:
            # 检查客户是否存在，不存在则需要创建新客户
            if not order.customer_id:
                # 创建新客户
                new_customer = Customer(
                    customer_name=order.customer_name,
                    contact_person=order.contact_person,
                    contact_email=order.contact_email,
                    contact_phone=order.contact_phone,
                    # 其他必要的客户信息可以根据实际情况设置默认值
                )
                db.add(new_customer)
                db.flush()  # 生成ID但还不提交
                
                # 更新订单的客户ID
                order.customer_id = new_customer.customer_id
            
            # 生成许可证
            license_data = OrderService._prepare_license_data(order)
            new_license = LicenseService.create_license(db, license_data)
            
            # 更新订单的许可证ID和状态
            order.license_id = new_license.license_id
            order.order_status = "COMPLETED"
        
        # 如果状态为"已拒绝"，则不生成许可证
        elif status_data.order_status == "REJECTED":
            pass
        
        # 提交更改
        db.commit()
        db.refresh(order)
        return order
    
    @staticmethod
    def _prepare_license_data(order: PurchaseOrder) -> Dict[str, Any]:
        """根据PO单准备许可证数据"""
        # 计算许可证的起始和结束日期
        start_date = datetime.now().date()
        expiry_date = start_date + timedelta(days=365)  # 默认一年有效期
        
        return {
            "customer_id": order.customer_id,
            "product_name": order.product_name,
            "product_version": order.product_version,
            "license_type": order.license_type,
            "order_date": order.order_date,
            "start_date": start_date,
            "expiry_date": expiry_date,
            "authorized_workspaces": order.authorized_workspaces,
            "authorized_users": order.authorized_users,
            "activation_mode": order.activation_mode,
            "cluster_id": order.cluster_id,
            "license_status": "ACTIVE",  # 默认状态为激活
            "notes": f"Auto-generated from PO #{order.po_number}"
        }
