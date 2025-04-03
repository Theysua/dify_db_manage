#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
合作商身份识别模型
用于API请求时识别合作商身份
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.db.database import Base


class PartnerIdentity(Base):
    """合作商身份识别，用于API请求时的身份验证"""
    __tablename__ = "partner_identities"
    
    identity_id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partners.partner_id", ondelete="CASCADE"), nullable=False)
    api_uuid = Column(String(36), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关联
    partner = relationship("Partner", back_populates="identities")
    email_mappings = relationship("PartnerEmailMapping", back_populates="identity", cascade="all, delete-orphan")
    
    @classmethod
    def generate_uuid(cls):
        """生成新的UUID"""
        return str(uuid.uuid4())


class PartnerEmailMapping(Base):
    """合作商邮箱映射，用于将邮箱与合作商身份关联"""
    __tablename__ = "partner_email_mappings"
    
    mapping_id = Column(Integer, primary_key=True, index=True)
    identity_id = Column(Integer, ForeignKey("partner_identities.identity_id", ondelete="CASCADE"), nullable=False)
    email_address = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # 关联
    identity = relationship("PartnerIdentity", back_populates="email_mappings")
