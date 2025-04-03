#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
采购订单(PO)数据生成工具
用于生成大量purchase_orders表数据
"""

import os
import sys
import random
from datetime import datetime, date, timedelta
from faker import Faker
import json
import string
from sqlalchemy import func, text

# 添加当前目录到环境变量
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入项目设置和模型
from app.db.database import SessionLocal
from app.models.order_models import PurchaseOrder
from app.models.models import Customer, SalesRep

# 初始化Faker
fake = Faker('zh_CN')

def generate_random_product():
    """生成随机产品信息"""
    products = [
        "Dify企业版", "Dify专业版", "Dify标准版", 
        "Dify定制开发服务", "技术支持服务包", "培训服务",
        "API调用包", "存储扩展包", "模型训练服务"
    ]
    
    license_types = ["Standard", "Professional", "Enterprise", "Custom"]
    
    return {
        "name": random.choice(products),
        "version": f"v{random.randint(1, 3)}.{random.randint(0, 9)}",
        "license_type": random.choice(license_types),
        "amount": round(random.uniform(5000, 100000), 2)
    }

def create_purchase_orders(db, count=50):
    """创建大量PO订单数据"""
    print(f"\n=== 创建{count}个采购订单(PO)数据 ===")
    
    # 获取所有活跃的客户
    customers = db.query(Customer).all()
    if not customers:
        print("❌ 没有找到客户数据，请先创建客户")
        return []
    
    # 使用原生SQL查询获取活跃的合作商身份和相关的合作商信息
    identities_data = []
    result = db.execute(text("""
    SELECT pi.identity_id, pi.api_uuid, pi.description, p.partner_id, p.partner_name 
    FROM partner_identities pi
    JOIN partners p ON pi.partner_id = p.partner_id
    WHERE pi.is_active = TRUE
    """)).fetchall()
    
    for row in result:
        identities_data.append({
            "identity_id": row[0],
            "api_uuid": row[1],
            "description": row[2],
            "partner_id": row[3],
            "partner_name": row[4]
        })
    
    # 获取所有销售代表
    sales_reps = db.query(SalesRep).all()
    
    orders = []
    today = date.today()
    
    # 可能的订单状态
    statuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']
    weights = [0.3, 0.4, 0.1, 0.2]  # 权重分配，APPROVED较多
    
    # 订单来源
    sources = ['API', 'MANUAL', 'PARTNER']
    source_weights = [0.4, 0.4, 0.2]
    
    for i in range(count):
        # 随机选择客户
        customer = random.choice(customers)
        
        # 生成订单日期（过去一年内的随机日期）
        order_date = today - timedelta(days=random.randint(1, 365))
        
        # 生成时间戳和随机字符以确保唯一性
        timestamp = int(datetime.now().timestamp())
        random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        
        # 生成订单号，增加时间戳和随机字符确保唯一性
        po_number = f"PO-{order_date.year}{order_date.month:02d}-{timestamp % 10000}{random_chars}"
        
        # 生成产品信息
        product = generate_random_product()
        
        # 选择订单状态
        order_status = random.choices(statuses, weights=weights)[0]
        
        # 选择订单来源
        order_source = random.choices(sources, weights=source_weights)[0]
        
        # 生成许可证相关信息
        quantity = random.randint(1, 10)
        workspaces = random.randint(1, 10)
        users = random.randint(10, 500)
        
        # 订单源信息
        source_details = {}
        
        # 如果是API来源，添加合作商信息
        if order_source == 'API' and identities_data:
            identity = random.choice(identities_data)
            source_details = {
                "partner_id": identity["partner_id"],
                "partner_name": identity["partner_name"],
                "api_uuid": identity["api_uuid"],
                "source_channel": random.choice(["网站", "邮件", "电话", "线下", "应用"])
            }
        
        # 如果订单状态不是PENDING，添加审核信息
        reviewed_at = None
        reviewed_by = None
        review_notes = None
        
        if order_status != 'PENDING':
            # 审核日期应该在订单日期之后
            reviewed_at = order_date + timedelta(days=random.randint(1, 30))
            if sales_reps:
                reviewer = random.choice(sales_reps)
                reviewed_by = reviewer.sales_rep_name
            else:
                reviewed_by = "系统管理员"
                
            if order_status == 'APPROVED':
                review_notes = "订单已审核通过，已生成许可证"
            elif order_status == 'REJECTED':
                review_notes = random.choice([
                    "订单信息不完整，请补充后重新提交",
                    "客户信用状况有问题，需进一步核实",
                    "产品配置不合理，请调整后重新提交",
                    "定价不符合规范，需调整"
                ])
            elif order_status == 'COMPLETED':
                review_notes = "订单已完成，许可证已交付"
        
        # 创建订单
        order = PurchaseOrder(
            po_number=po_number,
            customer_id=customer.customer_id,
            customer_name=customer.customer_name,
            contact_person=customer.contact_person,
            contact_email=customer.contact_email,
            contact_phone=customer.contact_phone,
            
            product_name=product["name"],
            product_version=product["version"],
            license_type=product["license_type"],
            quantity=quantity,
            amount=product["amount"] * quantity,
            currency="CNY",
            
            authorized_workspaces=workspaces,
            authorized_users=users,
            
            order_date=order_date,
            order_status=order_status,
            review_notes=review_notes,
            reviewed_by=reviewed_by,
            reviewed_at=reviewed_at,
            
            activation_mode=random.choice(['ONLINE', 'OFFLINE']),
            cluster_id=f"cluster-{random.randint(1000, 9999)}" if random.random() > 0.7 else None,
            
            license_id=f"DIFY-{1000+i:04d}" if order_status in ['APPROVED', 'COMPLETED'] else None,
            
            order_source=order_source,
            source_details=json.dumps(source_details) if source_details else None
        )
        
        db.add(order)
        orders.append(order)
        
        # 每20个订单提交一次，避免事务过大
        if (i + 1) % 20 == 0:
            db.commit()
            print(f"✅ 已创建 {i+1}/{count} 个采购订单")
    
    # 提交剩余的订单
    db.commit()
    print(f"✅ 已创建总计 {len(orders)} 个采购订单")
    
    return orders

def print_po_stats(db):
    """打印采购订单统计信息"""
    print("\n=== 采购订单统计信息 ===")
    
    # 总体统计
    total_orders = db.query(PurchaseOrder).count()
    total_amount = db.query(func.sum(PurchaseOrder.amount)).scalar() or 0
    print(f"\n总计: {total_orders}个订单, 总金额: ¥{total_amount:.2f}")
    
    # 按状态统计
    for status in ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']:
        count = db.query(PurchaseOrder).filter(PurchaseOrder.order_status == status).count()
        amount = db.query(func.sum(PurchaseOrder.amount)).filter(PurchaseOrder.order_status == status).scalar() or 0
        print(f"- {status}: {count}个订单, 总金额: ¥{amount:.2f}")
    
    # 按来源统计
    print("\n按来源统计:")
    for source in ['API', 'MANUAL', 'PARTNER']:
        count = db.query(PurchaseOrder).filter(PurchaseOrder.order_source == source).count()
        amount = db.query(func.sum(PurchaseOrder.amount)).filter(PurchaseOrder.order_source == source).scalar() or 0
        print(f"- {source}: {count}个订单, 总金额: ¥{amount:.2f}")

def main():
    """主函数"""
    db = SessionLocal()
    try:
        # 创建订单数据
        orders = create_purchase_orders(db, count=100)
        
        # 打印订单统计信息
        if orders:
            print_po_stats(db)
        
        print("\n✅ 所有采购订单数据生成完成！")
        
    except Exception as e:
        db.rollback()
        print(f"❌ 生成数据时出错: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
