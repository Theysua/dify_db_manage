from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any, Union
from datetime import date, datetime
from enum import Enum


class PartnerStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class OrderStatusEnum(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"


# Base schemas
class PartnerBase(BaseModel):
    PartnerName: str
    ContactPerson: Optional[str] = None
    ContactEmail: Optional[EmailStr] = None
    ContactPhone: Optional[str] = None
    Address: Optional[str] = None
    PartnerLevel: Optional[str] = None
    Region: Optional[str] = None
    Status: PartnerStatusEnum = PartnerStatusEnum.ACTIVE


class OrderItemBase(BaseModel):
    ProductName: str = "Dify Enterprise"
    LicenseType: str
    Quantity: int = 1
    UnitPrice: float
    TotalPrice: float
    LicenseDurationYears: int = 1
    TaxRate: float = 0.03
    EndUserName: str


class OrderBase(BaseModel):
    OrderNumber: str
    OrderDate: date = Field(default_factory=date.today)
    AgreementAcknowledged: bool = False
    AgreementDate: Optional[datetime] = None
    TotalAmount: float
    Status: OrderStatusEnum = OrderStatusEnum.PENDING
    Notes: Optional[str] = None


# Create schemas
class PartnerCreate(PartnerBase):
    Username: str
    Password: str


class OrderItemCreate(OrderItemBase):
    pass


class OrderCreate(OrderBase):
    PartnerID: int
    OrderItems: List[OrderItemCreate]


# Update schemas
class PartnerUpdate(BaseModel):
    PartnerName: Optional[str] = None
    ContactPerson: Optional[str] = None
    ContactEmail: Optional[EmailStr] = None
    ContactPhone: Optional[str] = None
    Address: Optional[str] = None
    PartnerLevel: Optional[str] = None
    Region: Optional[str] = None
    Status: Optional[PartnerStatusEnum] = None
    Password: Optional[str] = None


class OrderItemUpdate(BaseModel):
    ProductName: Optional[str] = None
    LicenseType: Optional[str] = None
    Quantity: Optional[int] = None
    UnitPrice: Optional[float] = None
    TotalPrice: Optional[float] = None
    LicenseDurationYears: Optional[int] = None
    TaxRate: Optional[float] = None
    EndUserName: Optional[str] = None


class OrderUpdate(BaseModel):
    OrderNumber: Optional[str] = None
    OrderDate: Optional[date] = None
    AgreementAcknowledged: Optional[bool] = None
    AgreementDate: Optional[datetime] = None
    TotalAmount: Optional[float] = None
    Status: Optional[OrderStatusEnum] = None
    Notes: Optional[str] = None


# Response schemas with IDs
class PartnerInfo(PartnerBase):
    PartnerID: int
    Username: str
    CreatedAt: datetime
    UpdatedAt: datetime
    OrderCount: Optional[int] = None
    
    class Config:
        orm_mode = True


class OrderItemInfo(OrderItemBase):
    ItemId: int
    OrderId: int
    CreatedAt: datetime
    UpdatedAt: datetime
    
    class Config:
        orm_mode = True


class OrderInfo(OrderBase):
    OrderId: int
    PartnerID: int
    CreatedAt: datetime
    UpdatedAt: datetime
    OrderItems: List[OrderItemInfo] = []
    PartnerName: Optional[str] = None
    
    class Config:
        orm_mode = True


# Auth schemas
class PartnerLogin(BaseModel):
    Username: str
    Password: str


class PartnerLoginResponse(BaseModel):
    AccessToken: str
    TokenType: str = "bearer"
    Partner: PartnerInfo


# Order submission schema for partners
class OrderSubmission(BaseModel):
    AgreementAcknowledged: bool = Field(..., description="Partner acknowledges agreement terms")
    OrderItems: List[OrderItemCreate] = Field(..., description="Items to order")
    Notes: Optional[str] = None


# Order status update schema for admin
class OrderStatusUpdate(BaseModel):
    status: OrderStatusEnum
    comments: Optional[str] = None
