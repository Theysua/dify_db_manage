"""
Script to create mock partner and order data using the correct enum values
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db.database import get_db
from app.models.partner_models import Partner, Order, OrderItem
from app.core.security import get_password_hash
from datetime import datetime, date
import uuid
import random

def create_mock_data():
    """Create mock data using the correct enum values"""
    db = next(get_db())
    try:
        # Create partners if they don't exist
        partners = create_mock_partners(db)
        
        # Create orders for each partner
        for partner in partners:
            create_orders_for_partner(db, partner)
        
        print("Mock data creation completed successfully!")
    except Exception as e:
        print(f"Error creating mock data: {e}")
    finally:
        db.close()

def create_mock_partners(db: Session):
    """Create mock partners and return the list of created partners"""
    partners_data = [
        {
            "partner_name": "智能科技公司",
            "contact_person": "王智",
            "contact_email": "wang.zhi@smart-tech.cn",
            "contact_phone": "13912345670",
            "address": "重庆市渝中区解放碑",
            "partner_level": "GOLD",
            "region": "西南",
            "status": "ACTIVE",
            "username": "smarttech",
            "password": "password123"
        },
        {
            "partner_name": "数智未来集团",
            "contact_person": "李明",
            "contact_email": "liming@digital-future.cn",
            "contact_phone": "13812345671",
            "address": "武汉市洪山区光谷",
            "partner_level": "SILVER",
            "region": "华中",
            "status": "ACTIVE",
            "username": "digitalfuture",
            "password": "password123"
        },
        {
            "partner_name": "智慧科技有限公司",
            "contact_person": "张三",
            "contact_email": "zhangsan@wisdom-tech.cn",
            "contact_phone": "13712345672",
            "address": "深圳市南山区科技园",
            "partner_level": "GOLD",
            "region": "华南",
            "status": "ACTIVE", 
            "username": "wisdomtech",
            "password": "password123"
        },
        {
            "partner_name": "云服务科技有限公司",
            "contact_person": "李四",
            "contact_email": "lisi@cloud-service.cn",
            "contact_phone": "13612345673",
            "address": "成都市高新区天府大道",
            "partner_level": "PLATINUM",
            "region": "西南",
            "status": "ACTIVE",
            "username": "cloudservice",
            "password": "password123"
        }
    ]
    
    created_partners = []
    
    for data in partners_data:
        try:
            # Check if partner already exists
            existing = db.query(Partner).filter(Partner.username == data["username"]).first()
            if existing:
                print(f"Partner {data['username']} already exists, using existing partner")
                created_partners.append(existing)
                continue
                
            # Create new partner
            partner = Partner(
                partner_name=data["partner_name"],
                contact_person=data["contact_person"],
                contact_email=data["contact_email"],
                contact_phone=data["contact_phone"],
                address=data["address"],
                partner_level=data["partner_level"],
                region=data["region"],
                status=data["status"],
                username=data["username"],
                password_hash=get_password_hash(data["password"])
            )
            
            db.add(partner)
            db.commit()
            db.refresh(partner)
            
            print(f"Created partner: {partner.partner_name}")
            created_partners.append(partner)
            
        except IntegrityError:
            db.rollback()
            print(f"Partner {data['username']} already exists (IntegrityError)")
        except Exception as e:
            db.rollback()
            print(f"Error creating partner {data['partner_name']}: {e}")
    
    # Get all existing partners
    all_partners = db.query(Partner).all()
    return all_partners

def create_orders_for_partner(db: Session, partner):
    """Create mock orders for a partner using correct enum values"""
    # Create 2 orders per partner
    for i in range(2):
        try:
            # Generate order ID and number
            order_id = str(uuid.uuid4())
            current_date = datetime.now().strftime("%Y%m%d")
            random_suffix = uuid.uuid4().hex[:6].upper()
            order_number = f"ORD-{current_date}-{random_suffix}"
            
            # Create order with correct status enum value
            # Use 'DRAFT' instead of 'PENDING'
            db_order = Order(
                order_id=order_id,
                customer_id=partner.partner_id,
                order_number=order_number,
                order_date=date.today(),
                total_amount=0,  # Will update after adding items
                status='DRAFT',  # Use correct enum value
                notes=f"测试订单 {i+1} - {partner.partner_name}"
            )
            
            db.add(db_order)
            db.flush()  # Flush to get order ID without committing
            
            # Create 1-3 order items
            total_amount = 0
            num_items = random.randint(1, 3)
            
            for j in range(num_items):
                # Generate item data
                product_name = random.choice(["Dify Enterprise", "Dify Professional", "Dify Standard"])
                license_type = random.choice(["Yearly", "Monthly", "Perpetual"])
                quantity = random.randint(1, 5)
                
                # Set price based on product
                if product_name == "Dify Enterprise":
                    unit_price = 10000.0
                elif product_name == "Dify Professional":
                    unit_price = 5000.0
                else:  # Standard
                    unit_price = 2000.0
                    
                total_price = unit_price * quantity
                total_amount += total_price
                
                # Create order item
                db_item = OrderItem(
                    order_id=db_order.order_id,
                    product_name=product_name,
                    license_type=license_type,
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=total_price,
                    license_duration_years=random.choice([1, 3, 5]),
                    tax_rate=0.03,
                    end_user_name=f"{partner.partner_name} - 客户{j+1}"
                )
                
                db.add(db_item)
            
            # Update order total
            db_order.total_amount = total_amount
            
            db.commit()
            print(f"Created order {order_number} for {partner.partner_name} with {num_items} items, total: {total_amount}")
            
            # For some orders, change status to CONFIRMED
            if random.random() > 0.5:
                db_order.status = 'CONFIRMED'
                db.commit()
                print(f"Updated order {order_number} status to CONFIRMED")
            
        except Exception as e:
            db.rollback()
            print(f"Error creating order for {partner.partner_name}: {e}")

if __name__ == "__main__":
    create_mock_data()
