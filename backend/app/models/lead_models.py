from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Float, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.db.database import Base

class LeadSource(Base):
    __tablename__ = "lead_sources"
    
    source_id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    leads = relationship("Lead", back_populates="source")


class LeadStatus(Base):
    __tablename__ = "lead_statuses"
    
    status_id = Column(Integer, primary_key=True, index=True)
    status_name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    display_order = Column(Integer, default=0)  # 用于控制漏斗显示顺序
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    leads = relationship("Lead", back_populates="status")


class Lead(Base):
    __tablename__ = "leads"
    
    lead_id = Column(Integer, primary_key=True, index=True)
    lead_name = Column(String(200), nullable=False)
    company_name = Column(String(200), nullable=False)
    contact_person = Column(String(100), nullable=False)
    contact_email = Column(String(100))
    contact_phone = Column(String(20))
    
    # 关联销售代表
    sales_rep_id = Column(Integer, ForeignKey("sales_reps.sales_rep_id", ondelete="SET NULL"))
    
    # 关联合作伙伴（如果通过合作伙伴引入）
    partner_id = Column(Integer, ForeignKey("partners.partner_id", ondelete="SET NULL"))
    
    # 商机来源
    source_id = Column(Integer, ForeignKey("lead_sources.source_id", ondelete="SET NULL"))
    
    # 商机状态 - 修改ON DELETE策略为CASCADE，保留NOT NULL约束
    status_id = Column(Integer, ForeignKey("lead_statuses.status_id", ondelete="CASCADE"), nullable=False)
    
    # 商机细节
    industry = Column(String(100))
    region = Column(String(100))
    product_interest = Column(String(200))  # 感兴趣的产品
    estimated_value = Column(Float)  # 预估价值
    currency = Column(String(3), default="CNY")
    expected_close_date = Column(Date)  # 预计成单日期
    probability = Column(Integer)  # 成单概率（百分比）
    
    # 跟踪字段
    last_activity_date = Column(DateTime)
    next_activity_date = Column(DateTime)
    next_activity_description = Column(Text)
    
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    sales_rep = relationship("SalesRep", foreign_keys=[sales_rep_id])
    partner = relationship("Partner", foreign_keys=[partner_id])
    source = relationship("LeadSource", back_populates="leads")
    status = relationship("LeadStatus", back_populates="leads")
    activities = relationship("LeadActivity", back_populates="lead", cascade="all, delete-orphan")


class LeadActivity(Base):
    __tablename__ = "lead_activities"
    
    activity_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id", ondelete="CASCADE"), nullable=False)
    activity_type = Column(Enum('EMAIL', 'CALL', 'MEETING', 'DEMO', 'QUOTATION', 'OTHER', name='activity_type_enum'), nullable=False)
    activity_date = Column(DateTime, nullable=False, default=func.now())
    description = Column(Text, nullable=False)
    outcome = Column(Text)
    created_by = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    lead = relationship("Lead", back_populates="activities")
