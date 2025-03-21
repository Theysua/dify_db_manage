from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any, Union
from datetime import date, datetime
from enum import Enum


# Enum definitions for various status types
class LicenseStatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    TERMINATED = "TERMINATED"
    PENDING = "PENDING"


class DeploymentStatusEnum(str, Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class DeploymentTypeEnum(str, Enum):
    INITIAL = "INITIAL"
    UPDATE = "UPDATE"
    MIGRATION = "MIGRATION"
    REINSTALLATION = "REINSTALLATION"


class PurchaseTypeEnum(str, Enum):
    NEW = "NEW"
    RENEWAL = "RENEWAL"
    UPGRADE = "UPGRADE"
    EXPANSION = "EXPANSION"


class PaymentStatusEnum(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    REFUNDED = "REFUNDED"
    CANCELLED = "CANCELLED"


class StatusEnum(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


# Base schemas
class CustomerBase(BaseModel):
    CustomerName: str
    ContactPerson: Optional[str] = None
    ContactEmail: Optional[EmailStr] = None
    ContactPhone: Optional[str] = None
    Address: Optional[str] = None
    Industry: Optional[str] = None
    CustomerType: Optional[str] = None
    Region: Optional[str] = None
    Notes: Optional[str] = None


class SalesRepBase(BaseModel):
    SalesRepName: str
    Email: EmailStr
    Phone: Optional[str] = None
    Department: Optional[str] = None
    Position: Optional[str] = None
    Status: StatusEnum = StatusEnum.ACTIVE


class ResellerBase(BaseModel):
    ResellerName: str
    ContactPerson: Optional[str] = None
    ContactEmail: Optional[EmailStr] = None
    ContactPhone: Optional[str] = None
    Address: Optional[str] = None
    PartnerLevel: Optional[str] = None
    Region: Optional[str] = None
    Status: StatusEnum = StatusEnum.ACTIVE


class LicenseBase(BaseModel):
    CustomerID: int
    SalesRepID: Optional[int] = None
    ResellerID: Optional[int] = None
    ProductName: str
    ProductVersion: Optional[str] = None
    LicenseType: str
    StartDate: date
    ExpiryDate: date
    AuthorizedWorkspaces: int = 0
    AuthorizedUsers: int = 0
    Notes: Optional[str] = None


class PurchaseRecordBase(BaseModel):
    LicenseID: str
    PurchaseType: PurchaseTypeEnum
    PurchaseDate: date
    OrderNumber: Optional[str] = None
    ContractNumber: Optional[str] = None
    Amount: float
    Currency: str = "USD"
    PaymentStatus: PaymentStatusEnum = PaymentStatusEnum.PENDING
    PaymentDate: Optional[date] = None
    WorkspacesPurchased: int = 0
    UsersPurchased: int = 0
    PreviousExpiryDate: Optional[date] = None
    NewExpiryDate: Optional[date] = None
    Notes: Optional[str] = None


class FactoryEngineerBase(BaseModel):
    EngineerName: str
    Email: EmailStr
    Phone: Optional[str] = None
    Department: Optional[str] = None
    Specialization: Optional[str] = None
    Status: StatusEnum = StatusEnum.ACTIVE


class DeploymentRecordBase(BaseModel):
    LicenseID: str
    DeploymentType: DeploymentTypeEnum
    DeploymentDate: date
    DeployedBy: str
    DeploymentStatus: DeploymentStatusEnum = DeploymentStatusEnum.PLANNED
    DeploymentEnvironment: Optional[str] = None
    ServerInfo: Optional[str] = None
    CompletionDate: Optional[date] = None
    Notes: Optional[str] = None
    EngineerAssignments: Optional[List[Dict[str, Any]]] = None


class DeploymentEngineerBase(BaseModel):
    EngineerID: int
    Role: Optional[str] = None


class ChangeTrackingBase(BaseModel):
    TableName: str
    RecordID: str
    FieldName: str
    OldValue: Optional[str] = None
    NewValue: Optional[str] = None
    ChangedBy: str
    ChangeReason: Optional[str] = None


# Create schemas
class CustomerCreate(CustomerBase):
    pass


class SalesRepCreate(SalesRepBase):
    pass


class ResellerCreate(ResellerBase):
    pass


class LicenseCreate(LicenseBase):
    pass


class PurchaseRecordCreate(PurchaseRecordBase):
    pass


class EngineerCreate(FactoryEngineerBase):
    Certification: Optional[str] = None
    ExperienceYears: Optional[int] = None


class FactoryEngineerCreate(FactoryEngineerBase):
    pass


class DeploymentEngineerCreate(DeploymentEngineerBase):
    pass


class DeploymentRecordCreate(DeploymentRecordBase):
    EngineerAssignments: Optional[List[DeploymentEngineerCreate]] = None


class ChangeTrackingCreate(ChangeTrackingBase):
    pass


# Update schemas
class CustomerUpdate(CustomerBase):
    CustomerName: Optional[str] = None


class SalesRepUpdate(SalesRepBase):
    SalesRepName: Optional[str] = None
    Email: Optional[EmailStr] = None


class ResellerUpdate(ResellerBase):
    ResellerName: Optional[str] = None


class LicenseUpdate(BaseModel):
    CustomerID: Optional[int] = None
    SalesRepID: Optional[int] = None
    ResellerID: Optional[int] = None
    ProductName: Optional[str] = None
    ProductVersion: Optional[str] = None
    LicenseType: Optional[str] = None
    StartDate: Optional[date] = None
    ExpiryDate: Optional[date] = None
    AuthorizedWorkspaces: Optional[int] = None
    AuthorizedUsers: Optional[int] = None
    ActualWorkspaces: Optional[int] = None
    ActualUsers: Optional[int] = None
    DeploymentStatus: Optional[DeploymentStatusEnum] = None
    DeploymentDate: Optional[date] = None
    LicenseStatus: Optional[LicenseStatusEnum] = None
    LastCheckDate: Optional[date] = None
    Notes: Optional[str] = None


class PurchaseRecordUpdate(BaseModel):
    PurchaseType: Optional[PurchaseTypeEnum] = None
    PurchaseDate: Optional[date] = None
    OrderNumber: Optional[str] = None
    ContractNumber: Optional[str] = None
    Amount: Optional[float] = None
    Currency: Optional[str] = None
    PaymentStatus: Optional[PaymentStatusEnum] = None
    PaymentDate: Optional[date] = None
    WorkspacesPurchased: Optional[int] = None
    UsersPurchased: Optional[int] = None
    PreviousExpiryDate: Optional[date] = None
    NewExpiryDate: Optional[date] = None
    Notes: Optional[str] = None


class FactoryEngineerUpdate(BaseModel):
    EngineerName: Optional[str] = None
    Email: Optional[EmailStr] = None
    Phone: Optional[str] = None
    Department: Optional[str] = None
    Specialization: Optional[str] = None
    Status: Optional[StatusEnum] = None


class EngineerUpdate(BaseModel):
    EngineerName: Optional[str] = None
    Email: Optional[EmailStr] = None
    Phone: Optional[str] = None
    Department: Optional[str] = None
    Specialization: Optional[str] = None
    Certification: Optional[str] = None
    ExperienceYears: Optional[int] = None
    Status: Optional[StatusEnum] = None


class DeploymentRecordUpdate(BaseModel):
    DeploymentType: Optional[DeploymentTypeEnum] = None
    DeploymentDate: Optional[date] = None
    DeployedBy: Optional[str] = None
    DeploymentStatus: Optional[DeploymentStatusEnum] = None
    DeploymentEnvironment: Optional[str] = None
    ServerInfo: Optional[str] = None
    CompletionDate: Optional[date] = None
    Notes: Optional[str] = None
    EngineerAssignments: Optional[List[DeploymentEngineerCreate]] = None


# Response schemas with IDs
class CustomerInfo(CustomerBase):
    CustomerID: int
    CreatedAt: datetime
    UpdatedAt: datetime

    class Config:
        orm_mode = True


class EngineerInfo(FactoryEngineerBase):
    EngineerID: int
    Certification: Optional[str] = None
    ExperienceYears: Optional[int] = None
    CreatedAt: datetime
    UpdatedAt: datetime

    class Config:
        orm_mode = True


class SalesRepInfo(SalesRepBase):
    SalesRepID: int
    CreatedAt: datetime
    UpdatedAt: datetime

    class Config:
        orm_mode = True


class ResellerInfo(ResellerBase):
    ResellerID: int
    CreatedAt: datetime
    UpdatedAt: datetime

    class Config:
        orm_mode = True


class DeploymentEngineerInfo(DeploymentEngineerBase):
    DeploymentID: int
    
    class Config:
        orm_mode = True


class EngineerAssignmentInfo(BaseModel):
    EngineerID: int
    EngineerName: str
    Email: str
    Role: Optional[str] = None
    
    class Config:
        orm_mode = True


class PurchaseRecordInfo(PurchaseRecordBase):
    PurchaseID: int
    CreatedAt: datetime
    UpdatedAt: datetime
    
    class Config:
        orm_mode = True


class DeploymentRecordInfo(DeploymentRecordBase):
    DeploymentID: int
    CreatedAt: datetime
    UpdatedAt: datetime
    EngineerAssignments: List[EngineerAssignmentInfo] = []
    
    class Config:
        orm_mode = True


class LicenseInfo(LicenseBase):
    LicenseID: str
    OrderDate: date
    ActualWorkspaces: int = 0
    ActualUsers: int = 0
    DeploymentStatus: DeploymentStatusEnum
    DeploymentDate: Optional[date] = None
    LicenseStatus: LicenseStatusEnum
    LastCheckDate: Optional[date] = None
    CreatedAt: datetime
    UpdatedAt: datetime
    
    class Config:
        orm_mode = True


class LicenseDetailedInfo(LicenseInfo):
    Customer: CustomerInfo
    SalesRep: Optional[SalesRepInfo] = None
    Reseller: Optional[ResellerInfo] = None
    PurchaseRecords: List[PurchaseRecordInfo] = []
    DeploymentRecords: List[DeploymentRecordInfo] = []
    
    class Config:
        orm_mode = True


class ChangeTrackingInfo(ChangeTrackingBase):
    ChangeID: int
    ChangedAt: datetime
    
    class Config:
        orm_mode = True


# Statistics and dashboard schemas
class CustomerStatistics(BaseModel):
    TotalCustomers: int
    ActiveCustomers: int
    InactiveCustomers: int
    NewCustomersThisMonth: int
    CustomersByRegion: Dict[str, int]
    CustomersByIndustry: Dict[str, int]


class LicenseStatistics(BaseModel):
    TotalLicenses: int
    ActiveLicenses: int
    ExpiredLicenses: int
    ExpiringNextMonth: int
    NewLicensesThisMonth: int
    LicensesByType: Dict[str, int]
    LicensesByStatus: Dict[str, int]
    

class DeploymentStatistics(BaseModel):
    TotalDeployments: int
    CompletedDeployments: int
    PlannedDeployments: int
    FailedDeployments: int
    AverageDeploymentTime: Optional[float] = None
    DeploymentsByType: Dict[str, int]


class RevenueStatistics(BaseModel):
    TotalRevenue: float
    RevenueThisMonth: float
    RevenueLastMonth: float
    RevenueGrowth: float
    RevenueByLicenseType: Dict[str, float]
    MonthlyRevenue: Dict[str, float]  # Month -> Revenue


class DashboardSummary(BaseModel):
    CustomerStats: CustomerStatistics
    LicenseStats: LicenseStatistics
    DeploymentStats: DeploymentStatistics
    RevenueStats: RevenueStatistics
    RecentLicenses: List[LicenseInfo]
    UpcomingRenewals: List[LicenseInfo]
    RecentDeployments: List[DeploymentRecordInfo]


# Token schema for authentication
class Token(BaseModel):
    AccessToken: str
    TokenType: str


class TokenData(BaseModel):
    Username: Optional[str] = None
    Scopes: List[str] = []


# User schemas for authentication
class UserBase(BaseModel):
    Username: str
    Email: EmailStr
    FullName: Optional[str] = None
    IsActive: bool = True
    Role: str = "user"  # admin, user, readonly


class UserCreate(UserBase):
    Password: str


class UserUpdate(BaseModel):
    Email: Optional[EmailStr] = None
    Password: Optional[str] = None
    FullName: Optional[str] = None
    IsActive: Optional[bool] = None
    Role: Optional[str] = None


class UserInfo(UserBase):
    UserID: int
    CreatedAt: datetime
    
    class Config:
        orm_mode = True
