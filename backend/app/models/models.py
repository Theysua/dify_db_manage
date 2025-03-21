from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Float, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.db.database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    customer_id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    contact_person = Column(String(100))
    contact_email = Column(String(100))
    contact_phone = Column(String(20))
    address = Column(String(255))
    industry = Column(String(50))
    customer_type = Column(String(50))
    region = Column(String(50))
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    licenses = relationship("License", back_populates="customer")


class SalesRep(Base):
    __tablename__ = "sales_reps"
    
    sales_rep_id = Column(Integer, primary_key=True, index=True)
    sales_rep_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20))
    department = Column(String(50))
    position = Column(String(50))
    status = Column(Enum('ACTIVE', 'INACTIVE', name='sales_rep_status_enum'), default='ACTIVE')
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    licenses = relationship("License", back_populates="sales_rep")


class Reseller(Base):
    __tablename__ = "resellers"
    
    reseller_id = Column(Integer, primary_key=True, index=True)
    reseller_name = Column(String(100), nullable=False)
    contact_person = Column(String(100))
    contact_email = Column(String(100))
    contact_phone = Column(String(20))
    address = Column(String(255))
    partner_level = Column(String(50))
    region = Column(String(50))
    status = Column(Enum('ACTIVE', 'INACTIVE', name='reseller_status_enum'), default='ACTIVE')
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    licenses = relationship("License", back_populates="reseller")


class License(Base):
    __tablename__ = "licenses"
    
    license_id = Column(String(50), primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id", ondelete="CASCADE"), nullable=False)
    sales_rep_id = Column(Integer, ForeignKey("sales_reps.sales_rep_id", ondelete="SET NULL"))
    reseller_id = Column(Integer, ForeignKey("resellers.reseller_id", ondelete="SET NULL"))
    product_name = Column(String(100), nullable=False)
    product_version = Column(String(50))
    license_type = Column(String(50), nullable=False)
    order_date = Column(Date, nullable=False)
    start_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    authorized_workspaces = Column(Integer, default=0)
    authorized_users = Column(Integer, default=0)
    actual_workspaces = Column(Integer, default=0)
    actual_users = Column(Integer, default=0)
    deployment_status = Column(Enum('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', name='deployment_status_enum'), default='PLANNED')
    deployment_date = Column(Date)
    license_status = Column(Enum('ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING', name='license_status_enum'), default='PENDING')
    last_check_date = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="licenses")
    sales_rep = relationship("SalesRep", back_populates="licenses")
    reseller = relationship("Reseller", back_populates="licenses")
    purchase_records = relationship("PurchaseRecord", back_populates="license", cascade="all, delete-orphan")
    deployment_records = relationship("DeploymentRecord", back_populates="license", cascade="all, delete-orphan")


class PurchaseRecord(Base):
    __tablename__ = "purchase_records"
    
    purchase_id = Column(Integer, primary_key=True, index=True)
    license_id = Column(String(50), ForeignKey("licenses.license_id", ondelete="CASCADE"), nullable=False)
    purchase_type = Column(Enum('NEW', 'RENEWAL', 'UPGRADE', 'EXPANSION', name='purchase_type_enum'), nullable=False)
    purchase_date = Column(Date, nullable=False)
    order_number = Column(String(50))
    contract_number = Column(String(50))
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    payment_status = Column(Enum('PENDING', 'PAID', 'REFUNDED', 'CANCELLED', name='payment_status_enum'), default='PENDING')
    payment_date = Column(Date)
    workspaces_purchased = Column(Integer, default=0)
    users_purchased = Column(Integer, default=0)
    previous_expiry_date = Column(Date)
    new_expiry_date = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    license = relationship("License", back_populates="purchase_records")


class FactoryEngineer(Base):
    __tablename__ = "factory_engineers"
    
    engineer_id = Column(Integer, primary_key=True, index=True)
    engineer_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20))
    department = Column(String(50))
    specialization = Column(String(100))
    status = Column(Enum('ACTIVE', 'INACTIVE', name='engineer_status_enum'), default='ACTIVE')
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    deployment_assignments = relationship("DeploymentEngineer", back_populates="engineer")


class DeploymentRecord(Base):
    __tablename__ = "deployment_records"
    
    deployment_id = Column(Integer, primary_key=True, index=True)
    license_id = Column(String(50), ForeignKey("licenses.license_id", ondelete="CASCADE"), nullable=False)
    deployment_type = Column(Enum('INITIAL', 'UPDATE', 'MIGRATION', 'REINSTALLATION', name='deployment_type_enum'), nullable=False)
    deployment_date = Column(Date, nullable=False)
    deployed_by = Column(String(100), nullable=False)  # Reseller or Factory
    deployment_status = Column(Enum('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', name='deployment_record_status_enum'), default='PLANNED')
    deployment_environment = Column(String(50))
    server_info = Column(Text)
    completion_date = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    license = relationship("License", back_populates="deployment_records")
    engineer_assignments = relationship("DeploymentEngineer", back_populates="deployment", cascade="all, delete-orphan")


class DeploymentEngineer(Base):
    __tablename__ = "deployment_engineers"
    
    deployment_id = Column(Integer, ForeignKey("deployment_records.deployment_id", ondelete="CASCADE"), primary_key=True)
    engineer_id = Column(Integer, ForeignKey("factory_engineers.engineer_id", ondelete="CASCADE"), primary_key=True)
    role = Column(String(50))
    
    # Relationships
    deployment = relationship("DeploymentRecord", back_populates="engineer_assignments")
    engineer = relationship("FactoryEngineer", back_populates="deployment_assignments")


class ChangeTracking(Base):
    __tablename__ = "change_tracking"
    
    change_id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String(50), nullable=False)
    record_id = Column(String(50), nullable=False)
    field_name = Column(String(50), nullable=False)
    old_value = Column(Text)
    new_value = Column(Text)
    changed_by = Column(String(100), nullable=False)
    change_reason = Column(Text)
    changed_at = Column(DateTime, default=func.now())
