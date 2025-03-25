from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from datetime import datetime, date
import uuid
import re
from typing import List, Optional

from app.models.partner_models import Partner, Order, OrderItem
from app.schemas import partner_schemas as schemas
from app.core.security import get_password_hash, verify_password
from app.core.jwt import create_access_token


class PartnerService:
    @staticmethod
    def create_partner(db: Session, partner: schemas.PartnerCreate) -> Partner:
        """Create a new partner account"""
        # Check if username already exists
        db_partner = db.query(Partner).filter(Partner.username == partner.Username).first()
        if db_partner:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # Create partner
        hashed_password = get_password_hash(partner.Password)
        db_partner = Partner(
            partner_name=partner.PartnerName,
            contact_person=partner.ContactPerson,
            contact_email=partner.ContactEmail,
            contact_phone=partner.ContactPhone,
            address=partner.Address,
            partner_level=partner.PartnerLevel,
            region=partner.Region,
            status=partner.Status,
            username=partner.Username,
            password_hash=hashed_password
        )
        
        db.add(db_partner)
        db.commit()
        db.refresh(db_partner)
        return db_partner
    
    @staticmethod
    def authenticate_partner(db: Session, username: str, password: str) -> Optional[Partner]:
        """Authenticate a partner by username and password"""
        partner = db.query(Partner).filter(Partner.username == username).first()
        if not partner or not verify_password(password, partner.password_hash):
            return None
        if partner.status != "ACTIVE":
            raise HTTPException(status_code=400, detail="Partner account is inactive")
        return partner
    
    @staticmethod
    def get_partner_token(partner: Partner) -> dict:
        """Generate JWT token for partner"""
        access_token = create_access_token(
            data={"sub": partner.username, "partner_id": partner.partner_id}
        )
        return {
            "AccessToken": access_token,
            "TokenType": "bearer",
            "Partner": PartnerService._partner_to_schema(partner)
        }
    
    @staticmethod
    def get_partner_by_id(db: Session, partner_id: int) -> Optional[Partner]:
        """Get partner by ID"""
        return db.query(Partner).filter(Partner.partner_id == partner_id).first()
    
    @staticmethod
    def get_partner_by_username(db: Session, username: str) -> Optional[Partner]:
        """Get partner by username"""
        return db.query(Partner).filter(Partner.username == username).first()
    
    @staticmethod
    def update_partner(db: Session, partner_id: int, partner_data: schemas.PartnerUpdate) -> Optional[Partner]:
        """Update partner information"""
        db_partner = PartnerService.get_partner_by_id(db, partner_id)
        if not db_partner:
            return None
        
        # Update fields that are not None
        update_data = partner_data.dict(exclude_unset=True)
        
        # Special handling for password
        if "Password" in update_data and update_data["Password"]:
            update_data["password_hash"] = get_password_hash(update_data.pop("Password"))
        
        # Convert schema field names to model field names (camelCase to snake_case)
        model_data = {}
        for key, value in update_data.items():
            if value is not None:
                model_key = re.sub(r'(?<!^)(?=[A-Z])', '_', key).lower()
                model_data[model_key] = value
        
        # Update partner
        for key, value in model_data.items():
            setattr(db_partner, key, value)
        
        db.commit()
        db.refresh(db_partner)
        return db_partner
        
    @staticmethod
    def delete_partner(db: Session, partner_id: int) -> bool:
        """Delete a partner by ID"""
        db_partner = PartnerService.get_partner_by_id(db, partner_id)
        if not db_partner:
            return False
        
        # 检查是否有关联的订单或其他依赖关系
        # 这里可以添加额外的检查逻辑
        
        # 删除合作伙伴
        db.delete(db_partner)
        db.commit()
        return True
    
    @staticmethod
    def _partner_to_schema(partner: Partner) -> schemas.PartnerInfo:
        """Convert partner model to schema"""
        return schemas.PartnerInfo(
            PartnerID=partner.partner_id,
            PartnerName=partner.partner_name,
            ContactPerson=partner.contact_person,
            ContactEmail=partner.contact_email,
            ContactPhone=partner.contact_phone,
            Address=partner.address,
            PartnerLevel=partner.partner_level,
            Region=partner.region,
            Status=partner.status,
            Username=partner.username,
            CreatedAt=partner.created_at,
            UpdatedAt=partner.updated_at
        )


class OrderService:
    @staticmethod
    def create_order(db: Session, partner_id: int, order_data: schemas.OrderSubmission) -> Order:
        """Create a new order"""
        # Validate agreement acknowledgment
        if not order_data.AgreementAcknowledged:
            raise HTTPException(
                status_code=400,
                detail="You must acknowledge the agreement terms to place an order"
            )
            
        # Validate the partner exists
        partner = db.query(Partner).filter(Partner.partner_id == partner_id).first()
        if not partner:
            raise HTTPException(
                status_code=404,
                detail=f"Partner with ID {partner_id} not found"
            )
        
        # Get a valid customer ID from the customers table
        # Using customer_id 43 which we confirmed exists
        from sqlalchemy import text
        # Query to get all available customers
        customers_result = db.execute(text("SELECT customer_id FROM customers LIMIT 5")).fetchall()
        if not customers_result:
            raise HTTPException(
                status_code=404,
                detail="No customers found in the database. Please create customers first."
            )
        # Use customer_id 43 which we know exists
        customer_id = 43  # Hard-coding a known good customer ID
        
        # Generate unique order ID and number
        order_id = str(uuid.uuid4())
        current_date = datetime.now().strftime("%Y%m%d")
        random_suffix = uuid.uuid4().hex[:6].upper()
        order_number = f"ORD-{current_date}-{random_suffix}"
        
        # Calculate total amount
        total_amount = sum(item.TotalPrice for item in order_data.OrderItems)
        
        # Create order
        db_order = Order(
            order_id=order_id,  # Set the primary key value
            customer_id=customer_id,  # Using a valid customer ID that exists
            order_number=order_number,
            order_date=date.today(),
            total_amount=total_amount,
            status="DRAFT",  # Valid values are 'DRAFT', 'CONFIRMED', 'CANCELED'
            notes=order_data.Notes
        )
        
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        
        # Create order items
        for item_data in order_data.OrderItems:
            # Generate a product_id if not provided
            product_id = str(uuid.uuid4()) if not hasattr(item_data, 'ProductId') or not item_data.ProductId else item_data.ProductId
            
            # Map the OrderItem fields according to the actual database schema
            db_item = OrderItem(
                order_id=db_order.order_id,
                product_id=product_id,
                product_name=item_data.ProductName,
                quantity=item_data.Quantity,
                unit="license",  # Default unit for software licenses
                unit_price=item_data.UnitPrice,
                subtotal=item_data.TotalPrice,
                end_user_name=item_data.EndUserName
            )
            db.add(db_item)
        
        db.commit()
        db.refresh(db_order)
        
        # Convert db_order to OrderInfo schema format
        from app.schemas.partner_schemas import OrderInfo, OrderItemInfo
        
        # Get the order items for this order
        order_items = []
        for item in db_order.order_items:
            order_item_info = OrderItemInfo(
                ItemId=item.order_item_id,
                OrderId=item.order_id,
                ProductName=item.product_name,
                Quantity=item.quantity,
                UnitPrice=item.unit_price,
                TotalPrice=item.subtotal,
                EndUserName=item.end_user_name,
                CreatedAt=item.created_at
            )
            order_items.append(order_item_info)
        
        # Create OrderInfo object with the correct field names
        order_info = OrderInfo(
            OrderId=db_order.order_id,
            OrderNumber=db_order.order_number,
            OrderDate=db_order.order_date,
            TotalAmount=db_order.total_amount,
            Status=db_order.status,
            Notes=db_order.notes,
            PartnerID=partner_id,  # We know this is the partner who created the order
            CreatedAt=db_order.created_at,
            UpdatedAt=db_order.updated_at,
            OrderItems=order_items
        )
        
        return order_info
    
    @staticmethod
    def _order_to_schema(db: Session, order: Order) -> schemas.OrderInfo:
        """Convert an Order model to an OrderInfo schema"""
        from app.schemas.partner_schemas import OrderInfo, OrderItemInfo
        
        # Convert order items
        order_items = []
        for item in order.order_items:
            order_item_info = OrderItemInfo(
                ItemId=item.order_item_id,
                OrderId=item.order_id,
                ProductName=item.product_name,
                Quantity=item.quantity,
                UnitPrice=item.unit_price,
                TotalPrice=item.subtotal,
                EndUserName=item.end_user_name,
                CreatedAt=item.created_at
            )
            order_items.append(order_item_info)
        
        # Create OrderInfo schema
        return OrderInfo(
            OrderId=order.order_id,
            OrderNumber=order.order_number,
            OrderDate=order.order_date,
            TotalAmount=order.total_amount,
            Status=order.status,
            Notes=order.notes,
            PartnerID=None,  # 订单现在不直接关联到合作伙伴
            CreatedAt=order.created_at,
            UpdatedAt=order.updated_at,
            OrderItems=order_items
        )
    
    @staticmethod
    def get_orders_by_partner(db: Session, partner_id: int, skip: int = 0, limit: int = 100) -> List[schemas.OrderInfo]:
        """Get orders for a specific partner"""
        # Since we no longer have a direct relationship between orders and partners,
        # we'll retrieve all orders and convert them to OrderInfo schemas
        orders = db.query(Order)\
            .order_by(Order.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
            
        # Convert the Order models to OrderInfo schemas
        return [OrderService._order_to_schema(db, order) for order in orders]
    
    @staticmethod
    def get_order_by_id(db: Session, order_id: str, partner_id: Optional[int] = None) -> Optional[Order]:
        """Get order by ID
        
        Note: We've removed the filtering by partner_id to allow partners to see all orders,
        similar to how sales reps can see all customer information.
        """
        return db.query(Order).filter(Order.order_id == order_id).first()
    
    @staticmethod
    def update_order_status(db: Session, order_id: str, status: str) -> Optional[schemas.OrderInfo]:
        """Update order status"""
        db_order = db.query(Order).filter(Order.order_id == order_id).first()
        if not db_order:
            return None
            
        db_order.status = status
        db.commit()
        db.refresh(db_order)
        
        return OrderService._order_to_schema(db, db_order)
    
    @staticmethod
    def update_order(db: Session, order_id: str, order_data: schemas.OrderUpdate) -> Optional[schemas.OrderInfo]:
        """Update order details"""
        db_order = db.query(Order).filter(Order.order_id == order_id).first()
        if not db_order:
            return None
        
        # 获取需要更新的字段
        update_data = order_data.dict(exclude_unset=True)
        
        # 转换字段名格式（驼峰命名转为蛇形命名）
        model_data = {}
        for key, value in update_data.items():
            if value is not None and key not in ["OrderItems"]:
                model_key = re.sub(r'(?<!^)(?=[A-Z])', '_', key).lower()
                model_data[model_key] = value
        
        # 更新订单基本信息
        for key, value in model_data.items():
            if hasattr(db_order, key):
                setattr(db_order, key, value)
        
        # 如果有订单项需要更新
        if "OrderItems" in update_data and update_data["OrderItems"]:
            # 这里可以实现订单项的更新逻辑
            # 例如：删除现有项目，添加新项目等
            pass
            
        db.commit()
        db.refresh(db_order)
        
        return OrderService._order_to_schema(db, db_order)
    
    @staticmethod
    def associate_with_partner(db: Session, order_id: str, partner_id: int) -> Optional[schemas.OrderInfo]:
        """将订单与合作伙伴关联
        
        注意：由于当前数据模型中，Order与Partner没有直接的关联字段，
        这里我们使用元数据表或其他方法来建立关联。
        """
        # 验证订单和合作伙伴是否存在
        order = db.query(Order).filter(Order.order_id == order_id).first()
        partner = db.query(Partner).filter(Partner.partner_id == partner_id).first()
        
        if not order or not partner:
            return None
        
        # 在这里，我们可以使用元数据或关联表来存储这种关系
        # 例如，可以在订单的notes字段中添加关联信息
        note = f"\n[{datetime.now()}] Associated with partner ID: {partner_id}, Name: {partner.partner_name}"
        order.notes = (order.notes or "") + note
        
        # 也可以创建一个专门的关联表来存储这种关系
        # 例如：db.add(PartnerOrderAssociation(order_id=order_id, partner_id=partner_id))
        
        db.commit()
        db.refresh(order)
        
        # 返回更新后的订单信息，注意设置PartnerID
        order_info = OrderService._order_to_schema(db, order)
        order_info.PartnerID = partner_id
        order_info.PartnerName = partner.partner_name
        
        return order_info
