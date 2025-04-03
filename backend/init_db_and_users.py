#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Dify Sales Database初始化脚本
简化版 - 专注于创建数据库和管理员账号
"""

import os
import sys
import time
import secrets
from datetime import datetime
import mysql.connector
from pathlib import Path

# 添加当前目录到环境变量
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入项目设置和模型
from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.models.user_models import User
from app.models.models import (
    Customer, SalesRep, Reseller, License, 
    PurchaseRecord, FactoryEngineer, DeploymentRecord, 
    DeploymentEngineer, ChangeTracking
)
from app.core.security import get_password_hash

def reset_database():
    """重置数据库"""
    print("\n=== 重置数据库 ===")
    
    # 连接到MySQL服务器
    conn = mysql.connector.connect(
        host=settings.MYSQL_HOST,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        port=settings.MYSQL_PORT
    )
    
    cursor = conn.cursor()
    
    try:
        # 删除数据库（如果存在）
        cursor.execute(f"DROP DATABASE IF EXISTS {settings.MYSQL_DB}")
        print(f"✅ 已删除现有数据库 {settings.MYSQL_DB}（如果存在）")
        
        # 创建数据库
        cursor.execute(f"CREATE DATABASE {settings.MYSQL_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✅ 已创建新数据库 {settings.MYSQL_DB}")
        
    except Exception as e:
        print(f"❌ 重置数据库时出错: {e}")
    finally:
        cursor.close()
        conn.close()
    
    # 使用SQLAlchemy创建所有表
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ 已创建所有数据表")
    except Exception as e:
        print(f"❌ 创建数据表时出错: {e}")

def generate_basic_data():
    """生成基本测试数据"""
    print("\n=== 生成基本测试数据 ===")
    
    db = SessionLocal()
    try:
        # 创建销售代表
        print("创建销售代表...")
        sales_reps = []
        for i in range(5):
            rep = SalesRep(
                sales_rep_name=f"销售{i+1}",
                email=f"sales{i+1}@dify.ai",
                phone=f"13800{i+1:05d}",
                salesperson_type="商业化内部运营" if i % 2 == 0 else "解决方案架构师",
                position=f"销售经理{i+1}级",
                status="ACTIVE"
            )
            db.add(rep)
            sales_reps.append(rep)
        
        # 提交以获取ID
        db.commit()
        print(f"✅ 已创建 {len(sales_reps)} 个销售代表")
        
        # 创建工程师
        print("创建工程师...")
        engineers = []
        for i in range(3):
            eng = FactoryEngineer(
                engineer_name=f"工程师{i+1}",
                email=f"engineer{i+1}@dify.ai",
                phone=f"13900{i+1:05d}",
                department="研发部" if i % 2 == 0 else "实施部",
                expertise=f"专长{i+1}",
                status="ACTIVE"
            )
            db.add(eng)
            engineers.append(eng)
        
        # 提交以获取ID
        db.commit()
        print(f"✅ 已创建 {len(engineers)} 个工程师")
        
        # 创建客户
        print("创建客户...")
        customers = []
        company_names = [
            "腾讯科技", "阿里巴巴", "百度在线", "京东集团", "小米科技",
            "华为技术", "字节跳动", "美团点评", "拼多多", "网易公司"
        ]
        
        for i, name in enumerate(company_names):
            customer = Customer(
                customer_name=name,
                contact_person=f"联系人{i+1}",
                contact_email=f"contact{i+1}@{name.lower()}.com",
                contact_phone=f"13700{i+1:05d}",
                address=f"北京市海淀区科技园{i+1}号",
                industry="互联网" if i % 2 == 0 else "电子商务",
                customer_type="企业",
                region="华北"
            )
            db.add(customer)
            customers.append(customer)
        
        # 提交以获取ID
        db.commit()
        print(f"✅ 已创建 {len(customers)} 个客户")
        
        # 创建许可证
        print("创建许可证...")
        import random
        from datetime import date, timedelta
        
        today = date.today()
        
        for i in range(15):
            customer = random.choice(customers)
            sales_rep = random.choice(sales_reps)
            
            # 生成随机日期
            order_date = today - timedelta(days=random.randint(30, 365))
            start_date = order_date + timedelta(days=random.randint(1, 30))
            expiry_date = start_date + timedelta(days=random.randint(180, 730))
            
            license = License(
                license_id=f"DIFY-{1000+i:04d}",
                customer_id=customer.customer_id,
                sales_rep_id=sales_rep.sales_rep_id,
                product_name="Dify Enterprise",
                product_version=f"v{random.randint(1, 3)}.{random.randint(0, 9)}",
                license_type=random.choice(["Standard", "Professional", "Enterprise"]),
                order_date=order_date,
                start_date=start_date,
                expiry_date=expiry_date,
                authorized_workspaces=random.randint(1, 10),
                authorized_users=random.randint(10, 100),
                license_status=random.choice(["ACTIVE", "PENDING", "EXPIRED"]),
                notes=f"测试许可证 #{i+1}"
            )
            db.add(license)
        
        # 提交变更
        db.commit()
        print("✅ 已创建 15 个许可证")
        
        # 创建部署记录
        print("创建部署记录...")
        
        # 获取所有许可证
        licenses = db.query(License).all()
        
        for i, license in enumerate(licenses[:10]):  # 只为部分许可证创建部署记录
            deploy_date = license.start_date + timedelta(days=random.randint(1, 30))
            
            record = DeploymentRecord(
                license_id=license.license_id,
                deployment_type=random.choice(["INITIAL", "UPDATE"]),
                deployment_date=deploy_date,
                deployed_by=random.choice(engineers).engineer_name,
                deployment_status=random.choice(["PLANNED", "IN_PROGRESS", "COMPLETED"]),
                deployment_environment=random.choice(["生产环境", "测试环境", "开发环境"]),
                server_info=f"服务器信息 #{i+1}",
                completion_date=deploy_date + timedelta(days=random.randint(1, 15)) if random.random() > 0.3 else None,
                notes=f"部署记录 #{i+1}"
            )
            db.add(record)
        
        # 提交变更
        db.commit()
        print("✅ 已创建 10 个部署记录")
        
        print("✅ 基本测试数据生成完成")
        
    except Exception as e:
        db.rollback()
        print(f"❌ 生成测试数据时出错: {e}")
    finally:
        db.close()

def create_admin_user():
    """创建管理员用户账号"""
    print("\n=== 创建管理员账号 ===")
    
    db = SessionLocal()
    try:
        # 检查管理员账号是否已存在
        admin = db.query(User).filter(User.username == "admin").first()
        
        if not admin:
            # 生成安全密码
            password = secrets.token_urlsafe(12)
            
            # 创建管理员账号
            admin = User(
                username="admin",
                email="admin@dify.ai",
                full_name="System Administrator",
                hashed_password=get_password_hash(password),
                is_active=True,
                role="admin",
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.add(admin)
            db.commit()
            
            print(f"""
✅ 管理员账号已创建:
- 用户名: admin
- 邮箱: admin@dify.ai
- 密码: {password}

请务必保存此密码!
            """)
        else:
            print("✅ 管理员账号已存在")
            
    except Exception as e:
        db.rollback()
        print(f"❌ 创建管理员账号时出错: {e}")
    finally:
        db.close()

def create_staff_user_accounts():
    """为销售代表和工程师创建用户账号"""
    print("\n=== 创建销售代表和工程师账号 ===")
    
    db = SessionLocal()
    try:
        # 获取所有销售代表
        sales_reps = db.query(SalesRep).filter(SalesRep.status == "ACTIVE").all()
        
        for rep in sales_reps:
            # 检查是否已有账号
            user = db.query(User).filter(User.email == rep.email).first()
            
            if not user:
                # 创建用户账号
                password = f"sales{rep.sales_rep_id}@2025"
                
                user = User(
                    username=f"sales{rep.sales_rep_id}",
                    email=rep.email,
                    full_name=rep.sales_rep_name,
                    hashed_password=get_password_hash(password),
                    is_active=True,
                    role="sales_rep",
                    sales_rep_id=rep.sales_rep_id,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                db.add(user)
                
                print(f"""
已创建销售代表账号:
- 姓名: {rep.sales_rep_name}
- 用户名: sales{rep.sales_rep_id}
- 密码: {password}
- 权限: 可查看所有客户、许可证、部署记录和工程师信息
                """)
        
        # 获取所有工程师
        engineers = db.query(FactoryEngineer).filter(FactoryEngineer.status == "ACTIVE").all()
        
        for eng in engineers:
            # 检查是否已有账号
            user = db.query(User).filter(User.email == eng.email).first()
            
            if not user:
                # 创建用户账号
                password = f"engineer{eng.engineer_id}@2025"
                
                user = User(
                    username=f"engineer{eng.engineer_id}",
                    email=eng.email,
                    full_name=eng.engineer_name,
                    hashed_password=get_password_hash(password),
                    is_active=True,
                    role="engineer",
                    engineer_id=eng.engineer_id,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                db.add(user)
                
                print(f"""
已创建工程师账号:
- 姓名: {eng.engineer_name}
- 用户名: engineer{eng.engineer_id}
- 密码: {password}
- 权限: 可查看所有部署记录、销售代表、客户和许可证信息
                """)
        
        # 提交所有变更
        db.commit()
        print("✅ 用户账号创建完成")
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建用户账号时出错: {e}")
    finally:
        db.close()

def main():
    """主函数"""
    print("\n========== Dify Sales 数据库初始化工具 ==========")
    print(f"数据库: {settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DB}")
    
    # 1. 重置数据库
    reset_database()
    
    # 2. 生成基本测试数据
    generate_basic_data()
    
    # 3. 创建管理员账号
    create_admin_user()
    
    # 4. 创建销售代表和工程师账号
    create_staff_user_accounts()
    
    print("\n✅ 数据库初始化完成!")
    print("\n您现在可以启动后端服务器:")
    print("uvicorn app.main:app --reload")

if __name__ == "__main__":
    main()
