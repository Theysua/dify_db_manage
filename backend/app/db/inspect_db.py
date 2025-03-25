"""
Script to inspect database structure and insert mock data
"""
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db.database import engine, get_db
from app.models.partner_models import Partner, Order, OrderItem
from app.core.security import get_password_hash
from datetime import datetime, date
import uuid
import random
import json

def inspect_database():
    """Inspect database tables and columns"""
    inspector = inspect(engine)
    
    # Get list of tables
    tables = inspector.get_table_names()
    print(f"Tables in database: {tables}")
    
    # Check each table's columns
    for table in tables:
        columns = inspector.get_columns(table)
        print(f"\nTable: {table}")
        for column in columns:
            print(f"  - {column['name']}: {column['type']} (nullable: {column.get('nullable', True)})")
            # If it's an enum type, print the enum values
            if str(column['type']).startswith('ENUM'):
                print(f"    Enum values: {column['type'].enums}")

def create_mock_partners():
    """Create mock partners"""
    db = next(get_db())
    try:
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
            }
        ]
        
        # Create partners
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
    finally:
        db.close()

def create_mock_orders_raw_sql():
    """Create mock orders using raw SQL to bypass ORM issues"""
    db = next(get_db())
    try:
        # Get partners
        partners = db.query(Partner).all()
        if not partners:
            print("No partners found, please create partners first")
            return
            
        for partner in partners:
            try:
                # Generate 2 orders per partner
                for _ in range(2):
                    # Generate order data
                    order_id = str(uuid.uuid4())
                    current_date = datetime.now().strftime("%Y%m%d")
                    random_suffix = uuid.uuid4().hex[:6].upper()
                    order_number = f"ORD-{current_date}-{random_suffix}"
                    
                    # Insert order using raw SQL
                    sql = text("""
                    INSERT INTO orders (order_id, customer_id, order_number, order_date, total_amount, status, notes, created_at, updated_at)
                    VALUES (:order_id, :customer_id, :order_number, :order_date, :total_amount, 'PENDING', :notes, NOW(), NOW())
                    """)
                    
                    db.execute(sql, {
                        'order_id': order_id,
                        'customer_id': partner.partner_id,
                        'order_number': order_number,
                        'order_date': date.today(),
                        'total_amount': 5000.0,
                        'notes': f"测试订单 for {partner.partner_name}"
                    })
                    
                    # Create 1-2 order items
                    num_items = random.randint(1, 2)
                    for i in range(num_items):
                        # Generate item data
                        product_name = random.choice(["Dify Enterprise", "Dify Professional", "Dify Standard"])
                        license_type = random.choice(["Yearly", "Monthly", "Perpetual"])
                        quantity = random.randint(1, 3)
                        unit_price = 5000.0 if product_name == "Dify Enterprise" else (3000.0 if product_name == "Dify Professional" else 1000.0)
                        total_price = unit_price * quantity
                        
                        # Insert order item using raw SQL
                        item_sql = text("""
                        INSERT INTO order_items (order_id, product_name, license_type, quantity, unit_price, total_price, license_duration_years, tax_rate, end_user_name, created_at, updated_at)
                        VALUES (:order_id, :product_name, :license_type, :quantity, :unit_price, :total_price, :license_duration_years, :tax_rate, :end_user_name, NOW(), NOW())
                        """)
                        
                        db.execute(item_sql, {
                            'order_id': order_id,
                            'product_name': product_name,
                            'license_type': license_type,
                            'quantity': quantity,
                            'unit_price': unit_price,
                            'total_price': total_price,
                            'license_duration_years': 1,
                            'tax_rate': 0.03,
                            'end_user_name': f"{partner.partner_name} 最终用户"
                        })
                        
                    # Update order total amount
                    update_sql = text("""
                    UPDATE orders SET total_amount = (
                        SELECT SUM(total_price) FROM order_items WHERE order_id = :order_id
                    ) WHERE order_id = :order_id
                    """)
                    
                    db.execute(update_sql, {'order_id': order_id})
                    db.commit()
                    print(f"Created order {order_number} for {partner.partner_name}")
            except Exception as e:
                db.rollback()
                print(f"Error creating order for {partner.partner_name}: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Inspecting database structure ===")
    inspect_database()
    
    print("\n=== Creating mock partners ===")
    create_mock_partners()
    
    print("\n=== Creating mock orders ===")
    create_mock_orders_raw_sql()
