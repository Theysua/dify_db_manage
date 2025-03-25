"""
Script to add mock data to the database for testing.
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db.database import engine, get_db
from app.models.partner_models import Base, Partner, Order, OrderItem
from app.core.security import get_password_hash
from datetime import datetime, date
import uuid
import random

def create_mock_data():
    """Create mock data for testing"""
    db = next(get_db())
    try:
        # Create mock partners
        create_mock_partners(db)
        
        # Create mock orders
        create_mock_orders(db)
        
        print("Mock data created successfully!")
    except Exception as e:
        print(f"Error creating mock data: {e}")
    finally:
        db.close()

def create_mock_partners(db: Session):
    """Create mock partners"""
    partners = [
        {
            "partner_name": "云计算科技有限公司",
            "contact_person": "张伟",
            "contact_email": "zhang.wei@cloud-tech.cn",
            "contact_phone": "13912345678",
            "address": "北京市海淀区中关村东路8号",
            "partner_level": "GOLD",
            "region": "华北",
            "status": "ACTIVE",
            "username": "cloudtech",
            "password": "password123"
        },
        {
            "partner_name": "数据智能科技有限公司",
            "contact_person": "李娜",
            "contact_email": "li.na@data-intel.cn",
            "contact_phone": "13812345678",
            "address": "上海市浦东新区张江高科技园区",
            "partner_level": "SILVER",
            "region": "华东",
            "status": "ACTIVE",
            "username": "dataintel",
            "password": "password123"
        },
        {
            "partner_name": "全球咨询服务公司",
            "contact_person": "王强",
            "contact_email": "wang.qiang@global-consulting.cn",
            "contact_phone": "13712345678",
            "address": "广州市天河区珠江新城",
            "partner_level": "PLATINUM",
            "region": "华南",
            "status": "ACTIVE",
            "username": "globalconsulting",
            "password": "password123"
        },
        {
            "partner_name": "企业解决方案有限公司",
            "contact_person": "刘明",
            "contact_email": "liu.ming@enterprise-solutions.cn",
            "contact_phone": "13612345678",
            "address": "深圳市南山区科技园",
            "partner_level": "GOLD",
            "region": "华南",
            "status": "ACTIVE",
            "username": "enterprise",
            "password": "password123"
        },
        {
            "partner_name": "未来创新科技有限公司",
            "contact_person": "陈芳",
            "contact_email": "chen.fang@future-tech.cn",
            "contact_phone": "13512345678",
            "address": "成都市高新区天府大道",
            "partner_level": "SILVER",
            "region": "西南",
            "status": "ACTIVE",
            "username": "futuretech",
            "password": "password123"
        }
    ]
    
    for partner_data in partners:
        try:
            # Check if the partner already exists
            existing_partner = db.query(Partner).filter(Partner.username == partner_data["username"]).first()
            if existing_partner:
                print(f"Partner {partner_data['username']} already exists, skipping.")
                continue
                
            # Create new partner
            password_hash = get_password_hash(partner_data["password"])
            partner = Partner(
                partner_name=partner_data["partner_name"],
                contact_person=partner_data["contact_person"],
                contact_email=partner_data["contact_email"],
                contact_phone=partner_data["contact_phone"],
                address=partner_data["address"],
                partner_level=partner_data["partner_level"],
                region=partner_data["region"],
                status=partner_data["status"],
                username=partner_data["username"],
                password_hash=password_hash
            )
            db.add(partner)
            db.commit()
            print(f"Created partner: {partner_data['partner_name']}")
        except IntegrityError:
            db.rollback()
            print(f"Partner {partner_data['username']} already exists (IntegrityError), skipping.")
        except Exception as e:
            db.rollback()
            print(f"Error creating partner {partner_data['partner_name']}: {e}")

def create_mock_orders(db: Session):
    """Create mock orders with items"""
    # Get all partners
    partners = db.query(Partner).all()
    if not partners:
        print("No partners found. Please create partners first.")
        return
    
    product_types = ["Dify Enterprise", "Dify Professional", "Dify Standard"]
    license_types = ["Yearly", "Monthly", "Perpetual"]
    
    # Create 2-3 orders for each partner
    for partner in partners:
        num_orders = random.randint(2, 3)
        for _ in range(num_orders):
            try:
                # Generate order data
                order_id = str(uuid.uuid4())
                current_date = datetime.now().strftime("%Y%m%d")
                random_suffix = uuid.uuid4().hex[:6].upper()
                order_number = f"ORD-{current_date}-{random_suffix}"
                
                # Random order data
                order_date = date.today()
                # Use only 'PENDING' status for mock data to avoid enum issues
                status = "PENDING"
                
                # Create order
                order = Order(
                    order_id=order_id,
                    customer_id=partner.partner_id,
                    order_number=order_number,
                    order_date=order_date,
                    total_amount=0,  # Will calculate after adding items
                    status=status,
                    notes=f"Mock order for {partner.partner_name}"
                )
                
                db.add(order)
                db.flush()  # Flush to get the order_id without committing
                
                # Create 1-3 order items
                num_items = random.randint(1, 3)
                total_amount = 0
                
                for _ in range(num_items):
                    product_name = random.choice(product_types)
                    license_type = random.choice(license_types)
                    quantity = random.randint(1, 5)
                    
                    # Price based on product type
                    if product_name == "Dify Enterprise":
                        unit_price = 5000.0
                    elif product_name == "Dify Professional":
                        unit_price = 3000.0
                    else:
                        unit_price = 1000.0
                    
                    # Discount for multiple quantities
                    if quantity > 3:
                        unit_price *= 0.9  # 10% discount
                    
                    total_price = unit_price * quantity
                    total_amount += total_price
                    
                    # Create order item
                    order_item = OrderItem(
                        order_id=order.order_id,
                        product_name=product_name,
                        license_type=license_type,
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=total_price,
                        license_duration_years=1,
                        tax_rate=0.03,
                        end_user_name=f"{partner.partner_name} 最终用户"
                    )
                    
                    db.add(order_item)
                
                # Update order total
                order.total_amount = total_amount
                db.commit()
                print(f"Created order {order_number} for {partner.partner_name} with {num_items} items, total: {total_amount}")
                
            except Exception as e:
                db.rollback()
                print(f"Error creating order for {partner.partner_name}: {e}")

if __name__ == "__main__":
    create_mock_data()
