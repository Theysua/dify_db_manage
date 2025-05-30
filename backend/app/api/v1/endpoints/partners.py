from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from app.services.partner_service import PartnerService, OrderService
from app.schemas import partner_schemas as schemas
from app.db.database import get_db
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.PartnerInfo])
async def get_all_partners(
    db: Session = Depends(get_db),
    current_user: deps.TokenData = Depends(deps.get_current_field_staff),
    skip: int = 0,
    limit: int = 100
):
    """获取所有合作伙伴列表
    
    根据运营需求，允许销售代表和工程师也可以查看合作伙伴信息
    """
    partners = PartnerService.get_all_partners(db, skip=skip, limit=limit)
    return [PartnerService._partner_to_schema(partner) for partner in partners]


@router.post("/register", response_model=schemas.PartnerInfo)
def register_partner(
    partner_data: schemas.PartnerCreate,
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Register a new partner (admin only)"""
    return PartnerService.create_partner(db, partner_data)


@router.post("/login", response_model=schemas.PartnerLoginResponse)
def login_partner(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login for partners"""
    partner = PartnerService.authenticate_partner(db, form_data.username, form_data.password)
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return PartnerService.get_partner_token(partner)


@router.get("/me", response_model=schemas.PartnerInfo)
def get_current_partner(
    current_partner: deps.TokenData = Depends(deps.get_current_partner),
    db: Session = Depends(get_db)
):
    """Get current partner profile"""
    # Get the partner from the database using the ID from the token
    partner = PartnerService.get_partner_by_id(db, current_partner.partner_id)
    
    # Convert to schema using the partner_to_schema method
    return PartnerService._partner_to_schema(partner)


@router.put("/me", response_model=schemas.PartnerInfo)
def update_partner_info(
    partner_data: schemas.PartnerUpdate,
    db: Session = Depends(get_db),
    current_partner: deps.TokenData = Depends(deps.get_current_partner)
):
    """Update current partner information"""
    updated_partner = PartnerService.update_partner(db, current_partner.partner_id, partner_data)
    if not updated_partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return updated_partner


@router.post("/orders", response_model=schemas.OrderInfo)
def create_order(
    order_data: schemas.OrderSubmission,
    db: Session = Depends(get_db),
    current_partner: deps.TokenData = Depends(deps.get_current_partner)
):
    """Create a new order"""
    return OrderService.create_order(db, current_partner.partner_id, order_data)


@router.get("/orders", response_model=List[schemas.OrderInfo])
def get_partner_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_partner: deps.TokenData = Depends(deps.get_current_partner)
):
    """Get partner's orders"""
    return OrderService.get_orders_by_partner(db, current_partner.partner_id, skip, limit)


@router.get("/orders/{order_id}", response_model=schemas.OrderInfo)
def get_order_details(
    order_id: str,
    db: Session = Depends(get_db),
    current_partner: deps.TokenData = Depends(deps.get_current_partner)
):
    """Get order details"""
    # We no longer filter by partner_id to allow partners to see all orders,
    # similar to how sales reps can see all customer information
    order = OrderService.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # 确保传入正确的参数：db作为第一个参数，order作为第二个参数
    return OrderService._order_to_schema(db, order)
