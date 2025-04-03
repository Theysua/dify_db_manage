#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Dify Sales Database初始化脚本
功能：
1. 检查并启动MySQL数据库
2. 初始化数据库结构（使用Alembic）
3. 生成模拟数据
4. 创建管理员账号
"""

import os
import sys
import time
import random
import subprocess
import argparse
from datetime import datetime, timedelta
import secrets
from pathlib import Path

try:
    import pymysql
    import sqlalchemy
    from sqlalchemy import create_engine, text
    from sqlalchemy.exc import OperationalError
    from sqlalchemy.orm import sessionmaker, scoped_session
    from passlib.context import CryptContext
except ImportError:
    print("缺少必要的依赖，正在安装...")
    subprocess.run([sys.executable, "-m", "pip", "install", 
                   "pymysql", "sqlalchemy", "passlib", "python-dotenv", "alembic"], 
                   check=True)
    import pymysql
    import sqlalchemy
    from sqlalchemy import create_engine, text
    from sqlalchemy.exc import OperationalError
    from sqlalchemy.orm import sessionmaker, scoped_session
    from passlib.context import CryptContext

# 导入项目配置
from dotenv import load_dotenv

# 获取脚本所在目录
SCRIPT_DIR = Path(__file__).resolve().parent

# 加载环境变量
env_file = SCRIPT_DIR / ".env"
if env_file.exists():
    load_dotenv(env_file)
else:
    print(f"警告: 未找到.env文件，将使用默认数据库配置")

# 数据库配置
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "dify_sales_db")

# 密码加密
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_mysql_running():
    """检查MySQL是否正在运行"""
    print("检查MySQL服务状态...")
    try:
        # 尝试建立MySQL连接
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            connect_timeout=5
        )
        connection.close()
        print("✅ MySQL服务正在运行")
        return True
    except pymysql.err.OperationalError as e:
        print(f"❌ MySQL连接失败: {e}")
        return False
    
def start_mysql_service():
    """尝试启动MySQL服务"""
    print("尝试启动MySQL服务...")
    
    # 检测操作系统
    if sys.platform.startswith('darwin'):  # macOS
        try:
            subprocess.run(["brew", "services", "start", "mysql"], check=True)
            print("✅ MySQL服务已通过Homebrew启动")
            time.sleep(5)  # 等待服务启动
            return verify_mysql_running()
        except subprocess.CalledProcessError:
            print("❌ 通过Homebrew启动MySQL失败")
        except FileNotFoundError:
            print("❌ 未找到Homebrew，请手动启动MySQL服务")
    elif sys.platform.startswith('linux'):  # Linux
        try:
            subprocess.run(["sudo", "systemctl", "start", "mysql"], check=True)
            print("✅ MySQL服务已通过systemctl启动")
            time.sleep(5)  # 等待服务启动
            return verify_mysql_running()
        except subprocess.CalledProcessError:
            print("❌ 通过systemctl启动MySQL失败")
    elif sys.platform.startswith('win'):  # Windows
        try:
            subprocess.run(["net", "start", "MySQL"], check=True, shell=True)
            print("✅ MySQL服务已在Windows上启动")
            time.sleep(5)  # 等待服务启动
            return verify_mysql_running()
        except subprocess.CalledProcessError:
            print("❌ 在Windows上启动MySQL失败")
    
    print("请手动启动MySQL服务后再运行此脚本")
    return False

def create_database():
    """创建数据库（如果不存在）"""
    print(f"检查数据库 {DB_NAME} 是否存在...")
    try:
        # 连接到MySQL服务器（无需指定数据库）
        connection = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD
        )
        
        with connection.cursor() as cursor:
            # 检查数据库是否存在
            cursor.execute(f"SHOW DATABASES LIKE '{DB_NAME}'")
            result = cursor.fetchone()
            
            if not result:
                print(f"创建数据库 {DB_NAME}...")
                cursor.execute(f"CREATE DATABASE {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                print(f"✅ 数据库 {DB_NAME} 已创建")
            else:
                print(f"✅ 数据库 {DB_NAME} 已存在")
        
        connection.close()
        return True
    except Exception as e:
        print(f"❌ 创建数据库时出错: {e}")
        return False

def run_alembic_migrations():
    """运行Alembic数据库迁移"""
    print("执行数据库迁移...")
    try:
        # 切换到项目目录以确保Alembic可以正确找到配置
        os.chdir(SCRIPT_DIR)
        
        # 运行Alembic迁移
        subprocess.run(["alembic", "upgrade", "head"], check=True)
        print("✅ 数据库迁移成功完成")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 数据库迁移失败: {e}")
        return False

def get_database_connection():
    """创建数据库连接"""
    try:
        # 创建数据库连接字符串
        db_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        
        # 创建引擎
        engine = create_engine(db_url)
        
        # 测试连接
        with engine.connect() as conn:
            print("✅ 已成功连接到数据库")
        
        # 创建会话工厂
        Session = scoped_session(sessionmaker(bind=engine))
        
        return engine, Session
    except Exception as e:
        print(f"❌ 无法连接到数据库: {e}")
        return None, None

def create_admin_account(session):
    """创建管理员账号"""
    print("创建管理员账号...")
    
    # 检查管理员账号是否已存在
    result = session.execute(
        text("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    ).fetchone()
    
    if result:
        print("✅ 管理员账号已存在")
        return
    
    # 生成安全密码
    password = secrets.token_urlsafe(12)
    hashed_password = pwd_context.hash(password)
    
    # 创建管理员账号
    session.execute(
        text("""
        INSERT INTO users (username, email, password_hash, role, full_name, created_at, updated_at, is_active)
        VALUES (:username, :email, :password_hash, :role, :full_name, :created_at, :updated_at, :is_active)
        """),
        {
            "username": "admin",
            "email": "admin@dify.ai",
            "password_hash": hashed_password,
            "role": "admin",
            "full_name": "System Administrator",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "is_active": True
        }
    )
    
    session.commit()
    print(f"""
    ✅ 管理员账号已创建:
    - 用户名: admin
    - 邮箱: admin@dify.ai
    - 密码: {password}
    
    请务必保存此密码！
    """)

def generate_mock_data(session):
    """生成模拟数据"""
    print("生成模拟数据...")
    
    # 公司名称列表（用于生成模拟数据）
    company_names = [
        "联想科技", "华为技术", "阿里巴巴", "腾讯科技", "百度在线", "小米科技",
        "京东集团", "网易公司", "美团点评", "字节跳动", "滴滴出行", "携程旅行",
        "好未来教育", "猿辅导", "新东方教育", "贝壳找房", "途家网络", "拼多多",
        "B站", "快手科技", "360集团", "金山软件", "搜狗公司", "蔚来汽车",
        "宁德时代", "大疆创新", "商汤科技", "旷视科技", "依图科技", "寒武纪科技"
    ]
    
    # 生成模拟客户数据
    print("创建客户数据...")
    for i in range(10):
        company_name = random.choice(company_names)
        company_names.remove(company_name)  # 避免重复
        
        session.execute(
            text("""
            INSERT INTO customers (name, contact_person, email, phone, address, created_at, updated_at, status)
            VALUES (:name, :contact_person, :email, :phone, :address, :created_at, :updated_at, :status)
            """),
            {
                "name": company_name,
                "contact_person": f"联系人{i+1}",
                "email": f"contact{i+1}@{company_name.lower().replace(' ', '')}.com",
                "phone": f"1381234{i:04d}",
                "address": f"北京市海淀区科技园区{i+1}号楼",
                "created_at": datetime.now() - timedelta(days=random.randint(0, 365)),
                "updated_at": datetime.now(),
                "status": random.choice(["active", "inactive"])
            }
        )
    
    # 提交更改
    session.commit()
    
    # 获取客户ID
    customers = session.execute(text("SELECT id FROM customers")).fetchall()
    customer_ids = [row[0] for row in customers]
    
    # 生成销售代表数据
    print("创建销售代表数据...")
    for i in range(5):
        session.execute(
            text("""
            INSERT INTO sales_reps (name, email, phone, region, created_at, updated_at, status)
            VALUES (:name, :email, :phone, :region, :created_at, :updated_at, :status)
            """),
            {
                "name": f"销售{i+1}",
                "email": f"sales{i+1}@dify.ai",
                "phone": f"1391234{i:04d}",
                "region": random.choice(["华北", "华东", "华南", "西南", "西北"]),
                "created_at": datetime.now() - timedelta(days=random.randint(0, 180)),
                "updated_at": datetime.now(),
                "status": "active"
            }
        )
    
    # 提交更改
    session.commit()
    
    # 获取销售代表ID
    sales_reps = session.execute(text("SELECT id FROM sales_reps")).fetchall()
    sales_rep_ids = [row[0] for row in sales_reps]
    
    # 生成工程师数据
    print("创建工程师数据...")
    for i in range(3):
        session.execute(
            text("""
            INSERT INTO engineers (name, email, phone, specialization, created_at, updated_at, status)
            VALUES (:name, :email, :phone, :specialization, :created_at, :updated_at, :status)
            """),
            {
                "name": f"工程师{i+1}",
                "email": f"engineer{i+1}@dify.ai",
                "phone": f"1351234{i:04d}",
                "specialization": random.choice(["部署", "集成", "训练", "维护"]),
                "created_at": datetime.now() - timedelta(days=random.randint(0, 180)),
                "updated_at": datetime.now(),
                "status": "active"
            }
        )
    
    # 提交更改
    session.commit()
    
    # 获取工程师ID
    engineers = session.execute(text("SELECT id FROM engineers")).fetchall()
    engineer_ids = [row[0] for row in engineers]
    
    # 生成许可证数据
    print("创建许可证数据...")
    license_types = ["BASIC", "STANDARD", "PROFESSIONAL", "ENTERPRISE"]
    statuses = ["active", "pending", "expired"]
    
    for i in range(20):
        customer_id = random.choice(customer_ids)
        sales_rep_id = random.choice(sales_rep_ids)
        
        # 生成许可证
        issue_date = datetime.now() - timedelta(days=random.randint(30, 365))
        expiry_date = issue_date + timedelta(days=random.randint(365, 1095))  # 1-3年
        
        session.execute(
            text("""
            INSERT INTO licenses (license_id, customer_id, sales_rep_id, license_type, quantity, 
                     issue_date, expiry_date, created_at, updated_at, status, price)
            VALUES (:license_id, :customer_id, :sales_rep_id, :license_type, :quantity, 
                    :issue_date, :expiry_date, :created_at, :updated_at, :status, :price)
            """),
            {
                "license_id": f"DIFY-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                "customer_id": customer_id,
                "sales_rep_id": sales_rep_id,
                "license_type": random.choice(license_types),
                "quantity": random.randint(5, 100),
                "issue_date": issue_date,
                "expiry_date": expiry_date,
                "created_at": issue_date,
                "updated_at": datetime.now(),
                "status": random.choice(statuses),
                "price": random.choice([28000, 58000, 98000, 168000]) * random.randint(1, 5)
            }
        )
    
    # 提交更改
    session.commit()
    
    # 获取许可证ID
    licenses = session.execute(text("SELECT id FROM licenses")).fetchall()
    license_ids = [row[0] for row in licenses]
    
    # 生成部署记录
    print("创建部署记录...")
    deployment_statuses = ["pending", "in_progress", "completed", "failed"]
    
    for license_id in license_ids[:15]:  # 只为部分许可证创建部署记录
        engineer_id = random.choice(engineer_ids)
        start_date = datetime.now() - timedelta(days=random.randint(7, 90))
        
        # 如果部署完成，设置结束日期
        status = random.choice(deployment_statuses)
        end_date = start_date + timedelta(days=random.randint(1, 14)) if status in ["completed", "failed"] else None
        
        session.execute(
            text("""
            INSERT INTO deployment_records (license_id, engineer_id, start_date, end_date, 
                                          status, notes, created_at, updated_at)
            VALUES (:license_id, :engineer_id, :start_date, :end_date, 
                   :status, :notes, :created_at, :updated_at)
            """),
            {
                "license_id": license_id,
                "engineer_id": engineer_id,
                "start_date": start_date,
                "end_date": end_date,
                "status": status,
                "notes": random.choice([
                    "客户环境准备顺利",
                    "客户需要额外的定制化",
                    "遇到网络问题，需要额外配置",
                    "客户服务器资源不足，需要升级",
                    None
                ]),
                "created_at": start_date,
                "updated_at": end_date or datetime.now()
            }
        )
    
    # 创建合作伙伴数据
    print("创建合作伙伴数据...")
    for i in range(5):
        session.execute(
            text("""
            INSERT INTO partners (name, contact_person, email, phone, address, 
                               created_at, updated_at, status, commission_rate)
            VALUES (:name, :contact_person, :email, :phone, :address, 
                   :created_at, :updated_at, :status, :commission_rate)
            """),
            {
                "name": f"合作伙伴{i+1}",
                "contact_person": f"合伙人{i+1}",
                "email": f"partner{i+1}@example.com",
                "phone": f"1371234{i:04d}",
                "address": f"上海市浦东新区张江高科技园区{i+1}号楼",
                "created_at": datetime.now() - timedelta(days=random.randint(30, 180)),
                "updated_at": datetime.now(),
                "status": "active",
                "commission_rate": random.choice([0.1, 0.15, 0.2, 0.25, 0.3])
            }
        )
    
    # 提交所有更改
    session.commit()
    
    # 获取合作伙伴ID
    partners = session.execute(text("SELECT id FROM partners")).fetchall()
    partner_ids = [row[0] for row in partners]
    
    # 创建订单数据
    print("创建合作伙伴订单数据...")
    for i in range(10):
        partner_id = random.choice(partner_ids)
        order_date = datetime.now() - timedelta(days=random.randint(1, 90))
        
        # 创建订单
        session.execute(
            text("""
            INSERT INTO partner_orders (partner_id, order_number, total_amount, status, 
                                      order_date, created_at, updated_at)
            VALUES (:partner_id, :order_number, :total_amount, :status, 
                   :order_date, :created_at, :updated_at)
            """),
            {
                "partner_id": partner_id,
                "order_number": f"PO-{random.randint(10000, 99999)}",
                "total_amount": random.randint(100000, 500000),
                "status": random.choice(["pending", "approved", "rejected", "completed"]),
                "order_date": order_date,
                "created_at": order_date,
                "updated_at": datetime.now()
            }
        )
    
    # 提交更改
    session.commit()
    
    print("✅ 模拟数据生成完成")

def create_user_accounts(session):
    """创建销售和工程师用户账号"""
    print("创建销售和工程师用户账号...")
    
    # 获取销售代表
    sales_reps = session.execute(
        text("SELECT id, name, email FROM sales_reps WHERE status = 'active'")
    ).fetchall()
    
    # 获取工程师
    engineers = session.execute(
        text("SELECT id, name, email FROM engineers WHERE status = 'active'")
    ).fetchall()
    
    # 为销售代表创建账号
    for sales_rep in sales_reps:
        # 检查用户是否已存在
        existing_user = session.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": sales_rep[2]}
        ).fetchone()
        
        if not existing_user:
            # 生成密码
            password = f"sales{sales_rep[0]}@2025"
            hashed_password = pwd_context.hash(password)
            
            # 创建用户
            session.execute(
                text("""
                INSERT INTO users (username, email, password_hash, role, full_name, related_id, created_at, updated_at, is_active)
                VALUES (:username, :email, :password_hash, :role, :full_name, :related_id, :created_at, :updated_at, :is_active)
                """),
                {
                    "username": f"sales{sales_rep[0]}",
                    "email": sales_rep[2],
                    "password_hash": hashed_password,
                    "role": "sales_rep",
                    "full_name": sales_rep[1],
                    "related_id": sales_rep[0],
                    "created_at": datetime.now(),
                    "updated_at": datetime.now(),
                    "is_active": True
                }
            )
            print(f"✅ 已创建销售代表账号: {sales_rep[1]} (用户名: sales{sales_rep[0]}, 密码: {password})")
    
    # 为工程师创建账号
    for engineer in engineers:
        # 检查用户是否已存在
        existing_user = session.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": engineer[2]}
        ).fetchone()
        
        if not existing_user:
            # 生成密码
            password = f"engineer{engineer[0]}@2025"
            hashed_password = pwd_context.hash(password)
            
            # 创建用户
            session.execute(
                text("""
                INSERT INTO users (username, email, password_hash, role, full_name, related_id, created_at, updated_at, is_active)
                VALUES (:username, :email, :password_hash, :role, :full_name, :related_id, :created_at, :updated_at, :is_active)
                """),
                {
                    "username": f"engineer{engineer[0]}",
                    "email": engineer[2],
                    "password_hash": hashed_password,
                    "role": "engineer",
                    "full_name": engineer[1],
                    "related_id": engineer[0],
                    "created_at": datetime.now(),
                    "updated_at": datetime.now(),
                    "is_active": True
                }
            )
            print(f"✅ 已创建工程师账号: {engineer[1]} (用户名: engineer{engineer[0]}, 密码: {password})")
    
    # 提交更改
    session.commit()
    print("✅ 用户账号创建完成")

def main():
    """主函数，协调整个初始化过程"""
    parser = argparse.ArgumentParser(description="Dify销售系统数据库初始化工具")
    parser.add_argument("--no-mock-data", action="store_true", help="不生成模拟数据")
    parser.add_argument("--reset", action="store_true", help="重置数据库（警告：这将删除所有现有数据）")
    args = parser.parse_args()
    
    print("\n========== Dify Sales 数据库初始化工具 ==========\n")
    
    # 步骤1：检查MySQL是否运行
    mysql_running = verify_mysql_running()
    if not mysql_running:
        mysql_running = start_mysql_service()
        if not mysql_running:
            print("❌ 无法启动MySQL服务，初始化失败")
            return
    
    # 步骤2：创建数据库（如果不存在）
    if not create_database():
        print("❌ 无法创建数据库，初始化失败")
        return
    
    # 步骤3：运行数据库迁移
    if not run_alembic_migrations():
        print("❌ 数据库迁移失败，初始化失败")
        return
    
    # 步骤4：建立数据库连接
    engine, Session = get_database_connection()
    if not engine or not Session:
        print("❌ 无法连接到数据库，初始化失败")
        return
    
    # 创建会话
    session = Session()
    
    try:
        # 步骤5：创建管理员账号
        create_admin_account(session)
        
        # 步骤6：如果需要，生成模拟数据
        if not args.no_mock_data:
            generate_mock_data(session)
            # 创建销售和工程师用户账号
            create_user_accounts(session)
        
        print("\n✅ 数据库初始化成功完成！\n")
        
    except Exception as e:
        print(f"❌ 初始化过程中出错: {e}")
        session.rollback()
    finally:
        # 关闭会话
        session.close()

if __name__ == "__main__":
    main()
