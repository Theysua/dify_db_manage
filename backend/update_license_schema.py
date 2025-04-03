#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
更新许可证数据库表结构
为License表添加激活模式相关字段
"""

import os
import sys
from pathlib import Path
from datetime import datetime
import json
import mysql.connector

# 添加当前目录到环境变量
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入项目设置
from app.core.config import settings

def update_license_schema():
    """更新许可证数据库表结构，添加激活方式相关字段"""
    print("\n=== 更新许可证数据库表结构 ===")
    
    # 连接到MySQL数据库
    conn = mysql.connector.connect(
        host=settings.MYSQL_HOST,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        port=settings.MYSQL_PORT,
        database=settings.MYSQL_DB
    )
    
    cursor = conn.cursor()
    
    try:
        # 检查表中是否已有这些字段
        cursor.execute("SHOW COLUMNS FROM licenses LIKE 'activation_mode'")
        activation_mode_exists = cursor.fetchone()
        
        # 如果字段不存在，添加它们
        if not activation_mode_exists:
            print("添加激活方式相关字段...")
            
            # 添加activation_mode字段
            cursor.execute("""
                ALTER TABLE licenses 
                ADD COLUMN activation_mode ENUM('ONLINE', 'OFFLINE') NOT NULL DEFAULT 'ONLINE' 
                AFTER actual_users
            """)
            
            # 添加cluster_id字段
            cursor.execute("""
                ALTER TABLE licenses 
                ADD COLUMN cluster_id VARCHAR(100) NULL 
                AFTER activation_mode
            """)
            
            # 添加offline_code字段
            cursor.execute("""
                ALTER TABLE licenses 
                ADD COLUMN offline_code VARCHAR(255) NULL 
                AFTER cluster_id
            """)
            
            # 添加activation_history字段 (JSON类型)
            cursor.execute("""
                ALTER TABLE licenses 
                ADD COLUMN activation_history JSON NULL 
                AFTER offline_code
            """)
            
            # 添加last_activation_change字段
            cursor.execute("""
                ALTER TABLE licenses 
                ADD COLUMN last_activation_change DATETIME NULL 
                AFTER activation_history
            """)
            
            # 创建索引以提高查询性能
            cursor.execute("""
                CREATE INDEX idx_license_activation_mode ON licenses (activation_mode)
            """)
            
            print("✅ 许可证表结构更新完成")
        else:
            print("✅ 许可证表已包含激活方式相关字段，无需更新")
        
        # 提交更改
        conn.commit()
        
    except Exception as e:
        conn.rollback()
        print(f"❌ 更新许可证表结构时出错: {e}")
    finally:
        cursor.close()
        conn.close()

def update_existing_licenses():
    """更新现有许可证记录，初始化激活方式相关字段"""
    print("\n=== 更新现有许可证记录 ===")
    
    # 连接到MySQL数据库
    conn = mysql.connector.connect(
        host=settings.MYSQL_HOST,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        port=settings.MYSQL_PORT,
        database=settings.MYSQL_DB
    )
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        # 查询所有许可证
        cursor.execute("SELECT license_id FROM licenses")
        licenses = cursor.fetchall()
        
        if not licenses:
            print("数据库中无许可证记录")
            return
        
        # 初始化默认激活历史记录
        default_history = json.dumps({
            "changes": [{
                "timestamp": datetime.now().isoformat(),
                "from_mode": "ONLINE",
                "to_mode": "ONLINE",
                "cluster_id": None
            }]
        })
        
        # 为每个许可证设置默认激活信息
        for license in licenses:
            cursor.execute("""
                UPDATE licenses SET 
                activation_mode = 'ONLINE', 
                activation_history = %s,
                last_activation_change = %s
                WHERE license_id = %s AND (activation_mode IS NULL OR activation_history IS NULL)
            """, (default_history, datetime.now(), license['license_id']))
        
        conn.commit()
        print(f"✅ 更新了 {len(licenses)} 个许可证记录")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ 更新许可证记录时出错: {e}")
    finally:
        cursor.close()
        conn.close()

def main():
    """主函数"""
    print("\n========== 许可证激活模式数据库更新工具 ==========")
    print(f"数据库: {settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DB}")
    
    # 1. 更新表结构
    update_license_schema()
    
    # 2. 更新现有记录
    update_existing_licenses()
    
    print("\n✅ 许可证激活模式数据库更新完成!")

if __name__ == "__main__":
    main()
