from fastapi import APIRouter, Depends, HTTPException, status, Path, Query, Response, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
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
        # 由于Order模型现在使用customer_id而不是partner_id，这里暂时将订单数设为0
        # 需要根据实际业务关系修改此查询
        order_count = 0
        partner_info = PartnerService._partner_to_schema(partner)
        partner_info.OrderCount = order_count
        result.append(partner_info)
    
    # Return response with total count header
    return result


@router.post("/partners", response_model=schemas.PartnerInfo, status_code=status.HTTP_201_CREATED)
def create_partner(
    partner_data: schemas.PartnerCreate,
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Create a new partner (admin only)"""
    try:
        partner = PartnerService.create_partner(db, partner_data)
        return PartnerService._partner_to_schema(partner)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create partner: {str(e)}")


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
    # 转换为Pydantic模式对象再返回
    return PartnerService._partner_to_schema(partner)


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


@router.delete("/partners/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_partner(
    partner_id: int = Path(..., description="The Partner ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Delete a partner (admin only)"""
    success = PartnerService.delete_partner(db, partner_id)
    if not success:
        raise HTTPException(status_code=404, detail="Partner not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


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
    # 移除partner_id筛选，因为Order模型现在使用customer_id
    # 如果仍需按partner筛选订单，需要重新设计关联查询
    
    # Get total count for pagination
    total_count = orders.count()
    
    # Get orders with pagination
    orders = orders.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    
    # Convert to schema response
    result = []
    for order in orders:
        # 订单关联到customer而不是partner，使用customer_id
        order_info = OrderService._order_to_schema(db, order)
        # 由于订单不再直接关联到合作伙伴，这里暂时使用通用名称
        order_info.PartnerName = "Direct Customer Order"
        result.append(order_info)
    
    # Return response with total count header
    return result


@router.get("/orders/{order_id}", response_model=schemas.OrderInfo)
def get_order_details(
    order_id: str = Path(..., description="The Order ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Get order details by ID (admin only)"""
    order = OrderService.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # 将Order模型转换为OrderInfo schema
    return OrderService._order_to_schema(db, order)


@router.put("/orders/{order_id}/status", response_model=schemas.OrderInfo)
def update_order_status(
    status_data: schemas.OrderStatusUpdate,
    order_id: str = Path(..., description="The Order ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Update order status (admin only)"""
    # 获取订单进行验证
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # 添加评论（如果提供）
    if status_data.comments:
        order.notes = (order.notes or "") + f"\n[{datetime.now()}] Status changed to {status_data.status} - {status_data.comments}"
        db.commit()
    
    # 更新订单状态
    updated_order = OrderService.update_order_status(db, order_id, status_data.status)
    if not updated_order:
        raise HTTPException(status_code=404, detail="Failed to update order status")
    
    return updated_order


@router.put("/orders/{order_id}", response_model=schemas.OrderInfo)
def update_order(
    order_data: schemas.OrderUpdate,
    order_id: str = Path(..., description="The Order ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Update order details (admin only)"""
    updated_order = OrderService.update_order(db, order_id, order_data)
    if not updated_order:
        raise HTTPException(status_code=404, detail="Order not found or update failed")
    return updated_order


@router.post("/partners/{partner_id}/orders/{order_id}", response_model=schemas.OrderInfo)
def associate_partner_with_order(
    partner_id: int = Path(..., description="The Partner ID"),
    order_id: str = Path(..., description="The Order ID"),
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Associate a partner with an existing order (admin only)"""
    # 验证合作伙伴是否存在
    partner = db.query(Partner).filter(Partner.partner_id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    # 验证订单是否存在
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # 将订单与合作伙伴关联（在这里设置元数据或使用关联表）
    # 由于当前数据模型中没有直接关联，我们可以添加一个关联记录或元数据
    updated_order = OrderService.associate_with_partner(db, order_id, partner_id)
    if not updated_order:
        raise HTTPException(status_code=500, detail="Failed to associate partner with order")
    
    return updated_order


@router.get("/partners/{partner_id}/orders", response_model=List[schemas.OrderInfo])
def get_partner_orders(
    partner_id: int = Path(..., description="The Partner ID"),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: deps.TokenData = Depends(deps.get_current_admin_user)
):
    """Get all orders associated with a specific partner (admin only)"""
    # 验证合作伙伴是否存在
    partner = db.query(Partner).filter(Partner.partner_id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    # 获取与该合作伙伴关联的所有订单
    orders = OrderService.get_orders_by_partner(db, partner_id, skip, limit)
    
    # 如果有状态筛选，过滤结果
    if status:
        orders = [order for order in orders if order.Status == status]
    
    return orders
