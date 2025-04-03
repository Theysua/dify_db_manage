#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
订单数据大量生成工具
用于生成大量订单数据、测试合作商UUID身份验证系统
"""

import os
import sys
import random
from datetime import datetime, date, timedelta
from faker import Faker
import json
import string
from sqlalchemy import func

# 添加当前目录到环境变量
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入项目设置和模型
from app.db.database import SessionLocal
from app.models.partner_models import Partner, Order, OrderItem
from app.models.models import Customer
from app.models.partner_identity_models import PartnerIdentity

# 初始化Faker
fake = Faker('zh_CN')

def generate_random_product():
    """生成随机产品信息"""
    products = [
        "Dify企业版", "Dify专业版", "Dify标准版", 
        "Dify定制开发服务", "技术支持服务包", "培训服务",
        "API调用包", "存储扩展包", "模型训练服务"
    ]
    
    units = ["套", "次", "小时", "天", "个月", "年"]
    
    product = {
        "name": random.choice(products),
        "unit_price": round(random.uniform(1000, 50000), 2),
        "quantity": random.randint(1, 10),
        "unit": random.choice(units)
    }
    
    product["total_price"] = round(product["unit_price"] * product["quantity"], 2)
    return product

def create_orders(db, count=100):
    """创建大量订单数据"""
    print(f"\n=== 创建{count}个订单数据 ===")
    
    # 获取所有活跃的客户
    customers = db.query(Customer).all()
    if not customers:
        print("❌ 没有找到客户数据，请先创建客户")
        return []
    
    # 获取所有活跃的合作商身份
    identities = db.query(PartnerIdentity).filter(PartnerIdentity.is_active == True).all()
    if not identities:
        print("❌ 没有找到活跃的合作商身份识别，请先创建合作商身份")
        return []
    
    orders = []
    order_items = []
    today = date.today()
    
    for i in range(count):
        # 随机选择客户和合作商身份
        customer = random.choice(customers)
        identity = random.choice(identities)
        partner = identity.partner
        
        # 生成订单日期（过去一年内的随机日期）
        order_date = today - timedelta(days=random.randint(1, 365))
        
        # 生成时间戳和随机字符以确保唯一性
        timestamp = int(datetime.now().timestamp())
        random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        
        # 生成订单号，增加时间戳和随机字符确保唯一性
        order_number = f"PO-{order_date.year}{order_date.month:02d}-{timestamp % 10000}{random_chars}"
        
        # 创建订单ID，使用不同的时间戳
        timestamp2 = int(datetime.now().timestamp() * 1000) % 1000000
        order_id = f"ORD-{timestamp2}-{random.randint(1000, 9999)}"
        
        # 生成随机产品数量
        product_count = random.randint(1, 5)
        total_amount = 0.0
        
        # 生成订单的备注，包含合作商身份信息
        notes = f"由{partner.partner_name}提交的订单 (UUID: {identity.api_uuid})\n" + \
                f"客户: {customer.customer_name}, 联系人: {customer.contact_person}\n" + \
                f"来源渠道: {random.choice(['网站', '邮件', '电话', '线下', '应用'])}"
        
        # 创建订单
        order = Order(
            order_id=order_id,
            customer_id=customer.customer_id,
            order_number=order_number,
            order_date=order_date,
            total_amount=0.0,  # 暂时设置为0，稍后更新
            status=random.choice(["DRAFT", "CONFIRMED", "CANCELED"]),
            notes=notes
        )
        
        db.add(order)
        orders.append(order)
        
        # 提交订单以获取ID
        db.flush()
        
        # 为订单创建订单项
        for j in range(product_count):
            # 生成随机产品
            product = generate_random_product()
            
            # 创建订单项
            order_item = OrderItem(
                order_id=order.order_id,
                product_id=f"PROD-{random.randint(1000, 9999)}",
                product_name=product["name"],
                quantity=product["quantity"],
                unit=product["unit"],
                unit_price=product["unit_price"],
                subtotal=product["total_price"],
                end_user_name=customer.contact_person
            )
            
            db.add(order_item)
            order_items.append(order_item)
            
            # 累加总金额
            total_amount += product["total_price"]
        
        # 更新订单总金额
        order.total_amount = total_amount
        
        # 每20个订单提交一次，避免事务过大
        if (i + 1) % 20 == 0:
            db.commit()
            print(f"✅ 已创建 {i+1}/{count} 个订单")
    
    # 提交剩余的订单
    db.commit()
    print(f"✅ 已创建总计 {len(orders)} 个订单，{len(order_items)} 个订单项")
    
    return orders

def print_order_stats(db):
    """打印订单统计信息"""
    print("\n=== 订单统计信息 ===")
    
    # 按合作商统计订单
    partners = db.query(Partner).all()
    for partner in partners[:10]:  # 只显示前10个合作商的统计
        # 获取该合作商的所有UUID
        identities = db.query(PartnerIdentity).filter(PartnerIdentity.partner_id == partner.partner_id).all()
        if not identities:
            continue
            
        identity_uuids = [identity.api_uuid for identity in identities]
        
        # 统计该合作商的订单数量
        order_count = 0
        total_amount = 0
        
        for uuid in identity_uuids:
            # 在notes中查找包含该UUID的订单
            orders = db.query(Order).filter(Order.notes.like(f'%{uuid}%')).all()
            order_count += len(orders)
            total_amount += sum(order.total_amount for order in orders)
        
        if order_count > 0:
            print(f"{partner.partner_name}: {order_count}个订单, 总金额: ¥{total_amount:.2f}")
    
    # 总体统计
    total_orders = db.query(Order).count()
    total_amount = db.query(func.sum(Order.total_amount)).scalar() or 0
    print(f"\n总计: {total_orders}个订单, 总金额: ¥{total_amount:.2f}")
    
    # 按状态统计
    for status in ["DRAFT", "CONFIRMED", "CANCELED"]:
        count = db.query(Order).filter(Order.status == status).count()
        amount = db.query(func.sum(Order.total_amount)).filter(Order.status == status).scalar() or 0
        print(f"- {status}: {count}个订单, 总金额: ¥{amount:.2f}")

def main():
    """主函数"""
    db = SessionLocal()
    try:
        # 创建订单数据
        orders = create_orders(db, count=100)
        
        # 打印订单统计信息
        if orders:
            print_order_stats(db)
        
        print("\n✅ 所有订单数据生成完成！")
        
    except Exception as e:
        db.rollback()
        print(f"❌ 生成数据时出错: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
