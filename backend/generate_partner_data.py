#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
合作商数据大量生成工具
用于生成大量Partner、PartnerIdentity和PartnerEmailMapping数据
"""

import os
import sys
import random
from datetime import datetime, timedelta
from faker import Faker
import uuid
import secrets
import string
import hashlib

# 添加当前目录到环境变量
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入项目设置和模型
from app.db.database import SessionLocal
from app.models.partner_models import Partner
from app.models.partner_identity_models import PartnerIdentity, PartnerEmailMapping
from app.core.security import get_password_hash

# 初始化Faker
fake = Faker('zh_CN')

def generate_password():
    """生成随机强密码"""
    length = 12
    chars = string.ascii_letters + string.digits + "!@#$%^&*()"
    return ''.join(secrets.choice(chars) for _ in range(length))

def create_partners(db, count=20):
    """创建大量合作商数据"""
    print(f"\n=== 创建{count}个合作商数据 ===")
    
    partners = []
    partner_levels = ["钻石", "黄金", "白银", "铜牌", "基础"]
    regions = ["华北", "华东", "华南", "西南", "东北", "华中", "西北"]
    
    # 获取已存在的用户名
    existing_usernames = set()
    existing_partners = db.query(Partner.username).all()
    for partner in existing_partners:
        existing_usernames.add(partner.username)
    
    # 生成时间戳以确保用户名唯一
    timestamp = int(datetime.now().timestamp())
    
    for i in range(count):
        company_name = fake.company()
        
        # 生成唯一用户名
        username_base = company_name.replace("有限公司", "").replace("科技", "")
        username_base = username_base.replace(" ", "").lower()[:8]  # 取前8个字符
        
        # 结合时间戳和随机字符创建唯一用户名
        random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
        username = f"p{timestamp % 10000}_{username_base}_{random_suffix}"
        
        # 确保用户名唯一
        while username in existing_usernames:
            random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
            username = f"p{timestamp % 10000}_{username_base}_{random_suffix}"
        
        existing_usernames.add(username)  # 添加到已使用集合
        
        password = generate_password()
        
        partner = Partner(
            partner_name=company_name,
            contact_person=fake.name(),
            contact_email=fake.company_email(),
            contact_phone=fake.phone_number(),
            address=fake.address(),
            partner_level=random.choice(partner_levels),
            region=random.choice(regions),
            status="ACTIVE",
            username=username,
            password_hash=get_password_hash(password)
        )
        db.add(partner)
        partners.append((partner, password))
    
    # 提交以获取ID
    db.commit()
    print(f"✅ 已创建 {len(partners)} 个合作商")
    
    # 返回创建的合作商列表和对应密码
    return partners

def create_partner_identities(db, partners, identities_per_partner=3):
    """为每个合作商创建多个身份识别UUID"""
    print(f"\n=== 为{len(partners)}个合作商创建身份识别 ===")
    
    identities = []
    purposes = [
        "订单创建API", "客户查询API", "产品信息API", 
        "统计报表API", "用户管理API", "许可证验证API",
        "应用集成", "合作伙伴门户", "测试环境", "开发环境", "生产环境"
    ]
    
    for partner, _ in partners:
        # 为每个合作商生成多个身份
        for j in range(random.randint(1, identities_per_partner)):
            identity = PartnerIdentity(
                partner_id=partner.partner_id,
                api_uuid=str(uuid.uuid4()),
                description=f"{partner.partner_name} - {random.choice(purposes)}",
                is_active=random.choices([True, False], weights=[0.9, 0.1])[0]
            )
            db.add(identity)
            identities.append(identity)
    
    # 提交以获取ID
    db.commit()
    print(f"✅ 已创建 {len(identities)} 个合作商身份识别")
    
    return identities

def create_email_mappings(db, identities, emails_per_identity=5):
    """为身份识别创建邮箱映射"""
    print(f"\n=== 为{len(identities)}个身份识别创建邮箱映射 ===")
    
    email_mappings = []
    departments = ["销售部", "技术部", "市场部", "客服部", "采购部", "财务部", "运营部"]
    used_emails = set()  # 用于跟踪已使用的邮箱地址
    
    for identity in identities:
        # 针对每个身份生成随机数量的邮箱映射
        successful_mappings = 0
        max_attempts = 10  # 为每个身份最多尝试10次生成唯一邮箱
        attempts = 0
        
        while successful_mappings < random.randint(1, emails_per_identity) and attempts < max_attempts:
            attempts += 1
            
            # 确保域名是唯一的，加入时间戳和随机字符
            timestamp = int(datetime.now().timestamp()) % 10000
            random_chars = ''.join(random.choices(string.ascii_lowercase, k=3))
            domain = f"{random_chars}{timestamp}.{fake.tld()}"
            
            # 生成一个随机的部门或人名作为邮箱前缀
            if random.random() > 0.5:
                # 部门邮箱
                dept = random.choice(departments)
                email_prefix = f"{dept.lower()}{random.randint(1, 999)}"
            else:
                # 个人邮箱
                name = fake.romanized_name().lower().replace(" ", ".") + str(random.randint(1, 999))
                email_prefix = name
            
            email = f"{email_prefix}@{domain}"
            
            # 检查邮箱是否已存在
            if email in used_emails:
                continue  # 如果邮箱已存在，跳过并重试
            
            used_emails.add(email)  # 将新邮箱添加到已使用集合
            
            mapping = PartnerEmailMapping(
                identity_id=identity.identity_id,
                email_address=email,
                description=f"{identity.partner.partner_name} - {'部门邮箱' if random.random() > 0.5 else '个人邮箱'}"
            )
            db.add(mapping)
            email_mappings.append(mapping)
            successful_mappings += 1
    
    # 提交以获取ID
    db.commit()
    print(f"✅ 已创建 {len(email_mappings)} 个邮箱映射")
    
    return email_mappings

def main():
    """主函数"""
    db = SessionLocal()
    try:
        # 创建合作商
        partners = create_partners(db, count=30)
        
        # 创建身份识别
        identities = create_partner_identities(db, partners, identities_per_partner=3)
        
        # 创建邮箱映射
        email_mappings = create_email_mappings(db, identities, emails_per_identity=4)
        
        # 输出合作商凭证信息，方便测试
        print("\n=== 合作商登录凭证 ===")
        for i, (partner, password) in enumerate(partners[:5]):
            print(f"{i+1}. {partner.partner_name}")
            print(f"   用户名: {partner.username}")
            print(f"   密码: {password}")
            print("   API UUID:")
            
            # 显示该合作商的UUID和邮箱映射
            for identity in db.query(PartnerIdentity).filter(PartnerIdentity.partner_id == partner.partner_id).all():
                if identity.is_active:
                    print(f"   - {identity.api_uuid} ({identity.description})")
                    
                    # 显示该身份的邮箱映射
                    email_mappings = db.query(PartnerEmailMapping).filter(PartnerEmailMapping.identity_id == identity.identity_id).all()
                    if email_mappings:
                        print("     邮箱映射:")
                        for mapping in email_mappings[:3]:  # 只显示前3个
                            print(f"     * {mapping.email_address}")
                        if len(email_mappings) > 3:
                            print(f"     * ... 等{len(email_mappings)-3}个邮箱")
            print()
        
        print("\n✅ 所有合作商数据生成完成！")
        print(f"✅ 总计: {len(partners)}个合作商, {len(identities)}个身份识别, {len(email_mappings)}个邮箱映射")
        
    except Exception as e:
        db.rollback()
        print(f"❌ 生成数据时出错: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
