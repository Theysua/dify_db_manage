#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Dify Sales Database综合初始化脚本
功能：
1. 重置数据库
2. 生成测试数据
3. 创建管理员账号及销售代表、工程师用户账号
"""

import os
import sys
import argparse
from datetime import datetime
import secrets
from pathlib import Path

# 添加当前目录到环境变量，确保可以导入本地模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入项目模块
from app.core.config import settings
from app.db.database import SessionLocal, engine, Base
from app.models.user_models import User
from app.core.security import get_password_hash

# 导入现有的数据重置和测试数据生成函数
from reset_db import reset_database
from app.test_data import main as generate_test_data

def create_admin_account():
    """创建管理员账号以及为销售代表和工程师创建对应用户账号"""
    print("\n=== 创建管理员和用户账号 ===")
    
    # 创建数据库会话
    db = SessionLocal()
    try:
        # 检查管理员账号是否存在
        admin = db.query(User).filter(User.email == "admin@dify.ai").first()
        
        if not admin:
            # 生成强密码
            admin_password = secrets.token_urlsafe(12)
            
            # 创建管理员账号
            admin = User(
                email="admin@dify.ai",
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash(admin_password),
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
- 密码: {admin_password}

请记下此密码!
            """)
        else:
            print("✅ 管理员账号已存在，跳过创建")
        
        # 获取所有销售代表
        from app.models.models import SalesRep
        sales_reps = db.query(SalesRep).filter(SalesRep.status == "ACTIVE").all()
        
        # 为销售代表创建用户账号
        for rep in sales_reps:
            # 检查是否已有账号
            user = db.query(User).filter(User.email == rep.email).first()
            
            # 由于我们已经放宽了销售代表权限，现在他们可以查看
            # 所有客户、许可证、部署记录和工程师信息
            
            if not user:
                # 生成密码
                password = f"sales{rep.id}@2025"
                
                # 创建用户
                user = User(
                    email=rep.email,
                    username=f"sales{rep.id}",
                    full_name=rep.sales_rep_name,
                    hashed_password=get_password_hash(password),
                    is_active=True,
                    role="sales_rep",
                    sales_rep_id=rep.id,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                db.add(user)
                print(f"✅ 已创建销售代表账号: {rep.sales_rep_name} (用户名: sales{rep.id}, 密码: {password})")
        
        # 获取所有工程师
        from app.models.models import FactoryEngineer
        engineers = db.query(FactoryEngineer).filter(FactoryEngineer.status == "ACTIVE").all()
        
        # 为工程师创建用户账号
        for eng in engineers:
            # 检查是否已有账号
            user = db.query(User).filter(User.email == eng.email).first()
            
            # 由于我们已经放宽了工程师权限，现在他们可以查看
            # 所有部署记录、销售代表、客户和许可证信息
            
            if not user:
                # 生成密码
                password = f"engineer{eng.id}@2025"
                
                # 创建用户
                user = User(
                    email=eng.email,
                    username=f"engineer{eng.id}",
                    full_name=eng.engineer_name,
                    hashed_password=get_password_hash(password),
                    is_active=True,
                    role="engineer",
                    engineer_id=eng.id,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                db.add(user)
                print(f"✅ 已创建工程师账号: {eng.engineer_name} (用户名: engineer{eng.id}, 密码: {password})")
        
        # 提交所有更改
        db.commit()
        print("✅ 所有用户账号创建完成")
        
    except Exception as e:
        db.rollback()
        print(f"❌ 创建用户时出错: {e}")
    finally:
        db.close()

def setup_database(reset=True, test_data=True, admin=True):
    """设置数据库: 重置、生成测试数据和创建管理员账号"""
    try:
        if reset:
            # 步骤1: 重置数据库
            print("\n=== 重置数据库 ===")
            reset_database()
        
        if test_data:
            # 步骤2: 生成测试数据
            print("\n=== 生成测试数据 ===")
            generate_test_data()
        
        if admin:
            # 步骤3: 创建管理员账号
            create_admin_account()
        
        print("\n✅ 数据库设置完成!")
        print("\n您现在可以启动后端服务器:")
        print("uvicorn app.main:app --reload")
        
    except Exception as e:
        print(f"\n❌ 数据库设置过程中出错: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dify销售系统数据库初始化工具")
    parser.add_argument("--no-reset", action="store_true", help="不重置数据库")
    parser.add_argument("--no-test-data", action="store_true", help="不生成测试数据")
    parser.add_argument("--no-admin", action="store_true", help="不创建管理员账号")
    args = parser.parse_args()
    
    print("\n========== Dify Sales 数据库初始化工具 ==========")
    print(f"MySQL 数据库: {settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DB}")
    
    setup_database(
        reset=not args.no_reset,
        test_data=not args.no_test_data,
        admin=not args.no_admin
    )
