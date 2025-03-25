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
        
        # Generate unique order number
        current_date = datetime.now().strftime("%Y%m%d")
        random_suffix = uuid.uuid4().hex[:6].upper()
        order_number = f"ORD-{current_date}-{random_suffix}"
        
        # Calculate total amount
        total_amount = sum(item.TotalPrice for item in order_data.OrderItems)
        
        # Create order
        db_order = Order(
            partner_id=partner_id,
            order_number=order_number,
            order_date=date.today(),
            agreement_acknowledged=order_data.AgreementAcknowledged,
            agreement_date=datetime.now() if order_data.AgreementAcknowledged else None,
            total_amount=total_amount,
            status="PENDING",
            notes=order_data.Notes
        )
        
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        
        # Create order items
        for item_data in order_data.OrderItems:
            db_item = OrderItem(
                order_id=db_order.order_id,
                product_name=item_data.ProductName,
                license_type=item_data.LicenseType,
                quantity=item_data.Quantity,
                unit_price=item_data.UnitPrice,
                total_price=item_data.TotalPrice,
                license_duration_years=item_data.LicenseDurationYears,
                tax_rate=item_data.TaxRate,
                end_user_name=item_data.EndUserName
            )
            db.add(db_item)
        
        db.commit()
        db.refresh(db_order)
        return db_order
    
    @staticmethod
    def get_orders_by_partner(db: Session, partner_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        """Get orders for a specific partner"""
        return db.query(Order)\
            .filter(Order.partner_id == partner_id)\
            .order_by(Order.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    @staticmethod
    def get_order_by_id(db: Session, order_id: int, partner_id: Optional[int] = None) -> Optional[Order]:
        """Get order by ID, optionally filtered by partner ID"""
        query = db.query(Order).filter(Order.order_id == order_id)
        if partner_id:
            query = query.filter(Order.partner_id == partner_id)
        return query.first()
    
    @staticmethod
    def update_order_status(db: Session, order_id: int, status: str) -> Optional[Order]:
        """Update order status"""
        db_order = OrderService.get_order_by_id(db, order_id)
        if not db_order:
            return None
            
        db_order.status = status
        db.commit()
        db.refresh(db_order)
        return db_order
        
    @staticmethod
    def _order_to_schema(db: Session, order: Order) -> schemas.OrderInfo:
        """Convert order model to schema"""
        # Get order items
        order_items = []
        for item in order.order_items:
            order_items.append(schemas.OrderItemInfo(
                ItemId=item.item_id,
                OrderId=item.order_id,
                ProductName=item.product_name,
                LicenseType=item.license_type,
                Quantity=item.quantity,
                UnitPrice=item.unit_price,
                TotalPrice=item.total_price,
                LicenseDurationYears=item.license_duration_years,
                TaxRate=item.tax_rate,
                EndUserName=item.end_user_name,
                CreatedAt=item.created_at,
                UpdatedAt=item.updated_at
            ))
        
        # Create order info
        return schemas.OrderInfo(
            OrderId=order.order_id,
            PartnerID=order.partner_id,
            OrderNumber=order.order_number,
            OrderDate=order.order_date,
            AgreementAcknowledged=order.agreement_acknowledged,
            AgreementDate=order.agreement_date,
            TotalAmount=order.total_amount,
            Status=order.status,
            Notes=order.notes,
            CreatedAt=order.created_at,
            UpdatedAt=order.updated_at,
            OrderItems=order_items
        )
        
        db_order.status = status
        db.commit()
        db.refresh(db_order)
        return db_order
    
    @staticmethod
    def _order_to_schema(order: Order) -> schemas.OrderInfo:
        """Convert order model to schema"""
        return schemas.OrderInfo(
            OrderId=order.order_id,
            PartnerID=order.partner_id,
            OrderNumber=order.order_number,
            OrderDate=order.order_date,
            AgreementAcknowledged=order.agreement_acknowledged,
            AgreementDate=order.agreement_date,
            TotalAmount=order.total_amount,
            Status=order.status,
            Notes=order.notes,
            CreatedAt=order.created_at,
            UpdatedAt=order.updated_at,
            OrderItems=[OrderService._order_item_to_schema(item) for item in order.order_items]
        )
    
    @staticmethod
    def _order_item_to_schema(item: OrderItem) -> schemas.OrderItemInfo:
        """Convert order item model to schema"""
        return schemas.OrderItemInfo(
            ItemId=item.item_id,
            OrderId=item.order_id,
            ProductName=item.product_name,
            LicenseType=item.license_type,
            Quantity=item.quantity,
            UnitPrice=item.unit_price,
            TotalPrice=item.total_price,
            LicenseDurationYears=item.license_duration_years,
            TaxRate=item.tax_rate,
            EndUserName=item.end_user_name,
            CreatedAt=item.created_at,
            UpdatedAt=item.updated_at
        )
