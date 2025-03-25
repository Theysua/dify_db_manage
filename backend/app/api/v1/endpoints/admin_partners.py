from fastapi import APIRouter, Depends, HTTPException, status, Path, Query, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.services.partner_service import PartnerService, OrderService
from app.schemas import partner_schemas as schemas
from app.db.database import get_db
from app.api import deps
from app.models.partner_models import Partner, Order

router = APIRouter()


@router.get("/partners", response_model=List[schemas.PartnerInfo])
def get_all_partners(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Get all partners with filtering options (admin only)"""
    partners = db.query(Partner)
    if status:
        partners = partners.filter(Partner.status == status)
    if region:
        partners = partners.filter(Partner.region == region)
    
    # Get total count for pagination
    total_count = partners.count()
    
    # Add header for total count
    partners = partners.offset(skip).limit(limit).all()
    
    # Convert to schema response
    result = []
    for partner in partners:
        order_count = db.query(Order).filter(Order.partner_id == partner.partner_id).count()
        partner_info = PartnerService._partner_to_schema(partner)
        partner_info.OrderCount = order_count
        result.append(partner_info)
    
    # Return response with total count header
    return result


@router.get("/partners/{partner_id}", response_model=schemas.PartnerInfo)
def get_partner_by_id(
    partner_id: int = Path(..., description="The Partner ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Get partner details by ID (admin only)"""
    partner = PartnerService.get_partner_by_id(db, partner_id)
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return partner


@router.put("/partners/{partner_id}", response_model=schemas.PartnerInfo)
def update_partner(
    partner_data: schemas.PartnerUpdate,
    partner_id: int = Path(..., description="The Partner ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Update partner information (admin only)"""
    updated_partner = PartnerService.update_partner(db, partner_id, partner_data)
    if not updated_partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return updated_partner


@router.get("/orders", response_model=List[schemas.OrderInfo])
def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    partner_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Get all orders with filtering options (admin only)"""
    orders = db.query(Order)
    if status:
        orders = orders.filter(Order.status == status)
    if partner_id:
        orders = orders.filter(Order.partner_id == partner_id)
    
    # Get total count for pagination
    total_count = orders.count()
    
    # Get orders with pagination
    orders = orders.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    # Convert to schema response
    result = []
    for order in orders:
        partner = db.query(Partner).filter(Partner.partner_id == order.partner_id).first()
        order_info = OrderService._order_to_schema(db, order)
        order_info.PartnerName = partner.partner_name if partner else "Unknown Partner"
        result.append(order_info)
    
    # Return response with total count header
    return result


@router.get("/orders/{order_id}", response_model=schemas.OrderInfo)
def get_order_details(
    order_id: int = Path(..., description="The Order ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Get order details by ID (admin only)"""
    order = OrderService.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/orders/{order_id}/status", response_model=schemas.OrderInfo)
def update_order_status(
    status_data: schemas.OrderStatusUpdate,
    order_id: int = Path(..., description="The Order ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Update order status (admin only)"""
    updated_order = OrderService.update_order_status(db, order_id, status_data.status)
    if not updated_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Add comments if provided
    if status_data.comments:
        updated_order.notes = (updated_order.notes or "") + f"\n[{datetime.now()}] Status changed to {status_data.status} - {status_data.comments}"
        db.commit()
        db.refresh(updated_order)
    
    return OrderService._order_to_schema(db, updated_order)
