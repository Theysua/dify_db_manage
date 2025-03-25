from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field


# LeadSource
class LeadSourceBase(BaseModel):
    source_name: str
    description: Optional[str] = None
    is_active: bool = True


class LeadSourceCreate(LeadSourceBase):
    pass


class LeadSourceUpdate(LeadSourceBase):
    source_name: Optional[str] = None
    is_active: Optional[bool] = None


class LeadSource(LeadSourceBase):
    source_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# LeadStatus
class LeadStatusBase(BaseModel):
    status_name: str
    description: Optional[str] = None
    display_order: int = 0
    is_active: bool = True


class LeadStatusCreate(LeadStatusBase):
    pass


class LeadStatusUpdate(LeadStatusBase):
    status_name: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class LeadStatus(LeadStatusBase):
    status_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# LeadActivity
class LeadActivityBase(BaseModel):
    activity_type: str
    activity_date: datetime
    description: str
    outcome: Optional[str] = None


class LeadActivityCreate(LeadActivityBase):
    lead_id: int
    created_by: str


class LeadActivityUpdate(BaseModel):
    activity_type: Optional[str] = None
    activity_date: Optional[datetime] = None
    description: Optional[str] = None
    outcome: Optional[str] = None


class LeadActivity(LeadActivityBase):
    activity_id: int
    lead_id: int
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Lead
class LeadBase(BaseModel):
    lead_name: str
    company_name: str
    contact_person: str
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    sales_rep_id: Optional[int] = None
    partner_id: Optional[int] = None
    source_id: Optional[int] = None
    status_id: int
    industry: Optional[str] = None
    region: Optional[str] = None
    product_interest: Optional[str] = None
    estimated_value: Optional[float] = None
    currency: str = "CNY"
    expected_close_date: Optional[date] = None
    probability: Optional[int] = Field(None, ge=0, le=100)
    next_activity_date: Optional[datetime] = None
    next_activity_description: Optional[str] = None
    notes: Optional[str] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    lead_name: Optional[str] = None
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    sales_rep_id: Optional[int] = None
    partner_id: Optional[int] = None
    source_id: Optional[int] = None
    status_id: Optional[int] = None
    industry: Optional[str] = None
    region: Optional[str] = None
    product_interest: Optional[str] = None
    estimated_value: Optional[float] = None
    currency: Optional[str] = None
    expected_close_date: Optional[date] = None
    probability: Optional[int] = Field(None, ge=0, le=100)
    next_activity_date: Optional[datetime] = None
    next_activity_description: Optional[str] = None
    notes: Optional[str] = None


class LeadStatusUpdate(BaseModel):
    status_id: int
    notes: Optional[str] = None


class LeadInDB(LeadBase):
    lead_id: int
    last_activity_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Lead(LeadInDB):
    status: LeadStatus
    source: Optional[LeadSource] = None
    activities: List[LeadActivity] = []

    class Config:
        orm_mode = True


# Response models for aggregated data
class LeadCountByStatus(BaseModel):
    status_id: int
    status_name: str
    count: int
    total_value: float = 0.0


class LeadFunnelData(BaseModel):
    stages: List[LeadCountByStatus]
    total_leads: int
    total_value: float
