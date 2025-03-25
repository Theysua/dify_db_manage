from fastapi import APIRouter, Depends, HTTPException, Path
from typing import List
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api import deps
from app.schemas import partner_schemas
from app.services.partner_service import OrderService

router = APIRouter()


@router.get("/", response_model=List[partner_schemas.OrderInfo])
def get_all_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Get all orders (admin only)"""
    return OrderService.get_all_orders(db, skip, limit)


@router.get("/{order_id}", response_model=partner_schemas.OrderInfo)
def get_order_details(
    order_id: str = Path(..., description="The Order ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_field_staff)  # 允许管理员、销售代表和工程师访问
):
    """Get order details by ID (admin, sales reps, and engineers)"""
    order = OrderService.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # 将Order模型转换为OrderInfo schema
    return OrderService._order_to_schema(db, order)


@router.put("/{order_id}/status", response_model=partner_schemas.OrderInfo)
def update_order_status(
    status_data: partner_schemas.OrderStatusUpdate,
    order_id: str = Path(..., description="The Order ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Update order status (admin only)"""
    order = OrderService.update_order_status(db, order_id, status_data.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
