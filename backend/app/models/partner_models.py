from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Float, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.db.database import Base


class Partner(Base):
    __tablename__ = "partners"
    
    partner_id = Column(Integer, primary_key=True, index=True)
    partner_name = Column(String(100), nullable=False)
    contact_person = Column(String(100))
    contact_email = Column(String(100))
    contact_phone = Column(String(20))
    address = Column(String(255))
    partner_level = Column(String(50))
    region = Column(String(50))
    status = Column(Enum('ACTIVE', 'INACTIVE', name='partner_status_enum'), default='ACTIVE')
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关联
    identities = relationship("PartnerIdentity", back_populates="partner", cascade="all, delete-orphan")
    
    # Note: orders relationship removed since orders now reference customers, not partners


class Order(Base):
    __tablename__ = "orders"
    
    order_id = Column(String(50), primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False)
    order_number = Column(String(50), unique=True, nullable=False)
    order_date = Column(Date, nullable=False, default=func.current_date())
    total_amount = Column(Float, nullable=False)
    status = Column(Enum('DRAFT', 'CONFIRMED', 'CANCELED', name='order_status_enum'), default='DRAFT')
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    # Note: This relationship doesn't exist since customer_id now references customers table
    # partner = relationship("Partner", back_populates="orders", foreign_keys=[customer_id])
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    
    order_item_id = Column(Integer, primary_key=True, index=True)  # Correct column name
    order_id = Column(String(50), ForeignKey("orders.order_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(50), nullable=False)  # Added missing column
    product_name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit = Column(String(20))  # Added missing column
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)  # Correct column name (subtotal instead of total_price)
    end_user_name = Column(String(100))
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
