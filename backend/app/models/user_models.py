from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(Enum('admin', 'commercial_ops', 'sales_rep', 'engineer'), nullable=False)
    sales_rep_id = Column(Integer, ForeignKey('sales_reps.sales_rep_id', ondelete='SET NULL'), nullable=True)
    engineer_id = Column(Integer, ForeignKey('factory_engineers.engineer_id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
