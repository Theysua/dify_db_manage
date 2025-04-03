#!/usr/bin/env python
# -*- coding: utf-8 -*-

from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Float, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.db.database import Base

class PurchaseOrder(Base):
    """采购订单模型，用于接收和处理PO单"""
    __tablename__ = "purchase_orders"
    
    order_id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), nullable=False, unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=True)
    customer_name = Column(String(100), nullable=False)  # 冗余存储，便于查询
    contact_person = Column(String(100))
    contact_email = Column(String(100))
    contact_phone = Column(String(20))
    
    # 订单信息
    product_name = Column(String(100), nullable=False)
    product_version = Column(String(50))
    license_type = Column(String(50), nullable=False)
    quantity = Column(Integer, default=1)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    
    # 订单规格
    authorized_workspaces = Column(Integer, default=0)
    authorized_users = Column(Integer, default=0)
    
    # 订单状态和审核
    order_date = Column(Date, nullable=False)
    order_status = Column(Enum('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', name='order_status_enum'), default='PENDING')
    review_notes = Column(Text)
    reviewed_by = Column(String(100))
    reviewed_at = Column(DateTime, nullable=True)
    
    # 离线/在线激活设置
    activation_mode = Column(Enum('ONLINE', 'OFFLINE', name='po_activation_mode_enum'), default='ONLINE')
    cluster_id = Column(String(100), nullable=True)
    
    # 关联的许可证（审核通过后生成）
    license_id = Column(String(50), nullable=True)
    
    # 源信息
    order_source = Column(Enum('API', 'MANUAL', 'PARTNER', name='order_source_enum'), default='MANUAL')
    source_details = Column(JSON, nullable=True)  # 存储API来源的详细信息
    
    # 时间戳
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    customer = relationship("Customer", foreign_keys=[customer_id])
