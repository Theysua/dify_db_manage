import os
import sys
from datetime import datetime, timedelta, date
import random
from sqlalchemy.orm import Session
from faker import Faker

# 将父目录添加到 sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, engine
from app.models.models import (
    Customer, SalesRep, Reseller, License, PurchaseRecord,
    FactoryEngineer, DeploymentRecord, DeploymentEngineer, ChangeTracking
)

# 初始化 Faker，使用中文配置
fake = Faker('zh_CN')

# 常量
LICENSE_TYPES = ["Enterprise", "Education", "Partnership"]
REGIONS = ["华北", "华东", "华南", "西北", "西南", "东北", "海外"]
INDUSTRIES = ["金融", "教育", "制造业", "医疗", "IT", "零售", "能源", "政府", "咨询"]
DEPARTMENTS = ["销售", "市场", "产品", "客户成功", "解决方案", "合作伙伴"]
POSITIONS = ["销售经理", "高级销售经理", "销售总监", "销售副总裁", "销售代表"]
SPECIALIZATIONS = ["DevOps", "数据库", "网络", "安全", "前端", "后端", "全栈"]

def generate_phone():
    """生成中国手机号码"""
    prefixes = ['134', '135', '136', '137', '138', '139', '150', '151', '152', '158', '159', '182', '183', '184', '187', '188', '198']
    return random.choice(prefixes) + ''.join(random.choice('0123456789') for _ in range(8))

def create_customers(db: Session, count: int = 20):
    """创建客户数据"""
    customers = []
    for _ in range(count):
        customer = Customer(
            customer_name=fake.company(),
            contact_person=fake.name(),
            contact_email=fake.email(),
            contact_phone=generate_phone(),
            address=fake.address(),
            industry=random.choice(INDUSTRIES),
            customer_type=random.choice(["企业", "政府", "学校", "创业公司"]),
            region=random.choice(REGIONS),
            notes=fake.text(max_nb_chars=200) if random.random() > 0.7 else None
        )
        db.add(customer)
        customers.append(customer)
    
    db.commit()
    print(f"已创建 {count} 个客户")
    return customers

def create_sales_reps(db: Session, count: int = 10):
    """创建销售代表数据"""
    sales_reps = []
    for _ in range(count):
        rep = SalesRep(
            sales_rep_name=fake.name(),
            email=fake.email(),
            phone=generate_phone(),
            department=random.choice(DEPARTMENTS),
            position=random.choice(POSITIONS),
            status=random.choices(['ACTIVE', 'INACTIVE'], weights=[0.9, 0.1])[0]
        )
        db.add(rep)
        sales_reps.append(rep)
    
    db.commit()
    print(f"已创建 {count} 个销售代表")
    return sales_reps

def create_resellers(db: Session, count: int = 5):
    """创建经销商数据"""
    resellers = []
    for _ in range(count):
        reseller = Reseller(
            reseller_name=fake.company() + "科技有限公司",
            contact_person=fake.name(),
            contact_email=fake.email(),
            contact_phone=generate_phone(),
            address=fake.address(),
            partner_level=random.choice(["白金", "黄金", "白银", "铜牌"]),
            region=random.choice(REGIONS),
            status=random.choices(['ACTIVE', 'INACTIVE'], weights=[0.8, 0.2])[0]
        )
        db.add(reseller)
        resellers.append(reseller)
    
    db.commit()
    print(f"已创建 {count} 个经销商")
    return resellers

def create_engineers(db: Session, count: int = 8):
    """创建工程师数据"""
    engineers = []
    for _ in range(count):
        engineer = FactoryEngineer(
            engineer_name=fake.name(),
            email=fake.email(),
            phone=generate_phone(),
            department="技术服务",
            expertise=random.choice(SPECIALIZATIONS),
            status=random.choices(['ACTIVE', 'INACTIVE'], weights=[0.9, 0.1])[0]
        )
        db.add(engineer)
        engineers.append(engineer)
    
    db.commit()
    print(f"已创建 {count} 个工程师")
    return engineers

def create_licenses(db: Session, customers, sales_reps, resellers, count: int = 30):
    """创建许可证数据"""
    licenses = []
    today = date.today()
    
    # 确保每个客户至少有一个许可证
    for i, customer in enumerate(customers):
        # 生成基本信息
        order_date = today - timedelta(days=random.randint(10, 365))
        start_date = order_date + timedelta(days=random.randint(1, 10))
        duration = random.choice([90, 180, 365, 730])  # 试用期/1年/2年
        expiry_date = start_date + timedelta(days=duration)
        
        # 随机状态
        if expiry_date < today:
            license_status = "EXPIRED"
        elif start_date > today:
            license_status = "PENDING"
        else:
            license_status = "ACTIVE"

        # 随机选择销售代表和经销商（可能为空）
        sales_rep = random.choice(sales_reps) if random.random() > 0.2 else None
        reseller = random.choice(resellers) if random.random() > 0.7 else None
        
        # 工作区和用户数量
        workspaces = random.randint(1, 10)
        users = random.randint(5, 50)
        
        # 实际使用数量（不能超过授权数量）
        actual_workspaces = random.randint(0, workspaces)
        actual_users = random.randint(0, users)
        
        # 部署状态
        if license_status == "ACTIVE":
            deployment_status = random.choices(
                ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
                weights=[0.1, 0.2, 0.65, 0.05]
            )[0]
        else:
            deployment_status = "PLANNED"

        # 创建许可证
        license_id = f"LIC-{fake.hexify(text='^^^^^^')}-{i+1}"
        license = License(
            license_id=license_id,
            customer_id=customer.customer_id,
            sales_rep_id=sales_rep.sales_rep_id if sales_rep else None,
            reseller_id=reseller.reseller_id if reseller else None,
            product_name="Dify Enterprise",
            product_version=random.choice(["1.0", "1.5", "2.0", "2.1"]),
            license_type=random.choice(LICENSE_TYPES),
            order_date=order_date,
            start_date=start_date,
            expiry_date=expiry_date,
            authorized_workspaces=workspaces,
            authorized_users=users,
            actual_workspaces=actual_workspaces,
            actual_users=actual_users,
            deployment_status=deployment_status,
            deployment_date=start_date + timedelta(days=random.randint(1, 30)) if deployment_status != "PLANNED" else None,
            license_status=license_status,
            last_check_date=today - timedelta(days=random.randint(0, 30)) if license_status == "ACTIVE" else None,
            notes=fake.paragraph() if random.random() > 0.7 else None
        )
        db.add(license)
        licenses.append(license)
    
    # 创建额外的许可证
    extra_count = count - len(customers)
    if extra_count > 0:
        for i in range(extra_count):
            # 随机选择客户
            customer = random.choice(customers)
            
            # 生成基本信息
            order_date = today - timedelta(days=random.randint(10, 365))
            start_date = order_date + timedelta(days=random.randint(1, 10))
            duration = random.choice([90, 180, 365, 730])  # 试用期/1年/2年
            expiry_date = start_date + timedelta(days=duration)
            
            # 随机状态
            if expiry_date < today:
                license_status = "EXPIRED"
            elif start_date > today:
                license_status = "PENDING"
            else:
                license_status = "ACTIVE"

            # 随机选择销售代表和经销商（可能为空）
            sales_rep = random.choice(sales_reps) if random.random() > 0.2 else None
            reseller = random.choice(resellers) if random.random() > 0.7 else None
            
            # 工作区和用户数量
            workspaces = random.randint(1, 10)
            users = random.randint(5, 50)
            
            # 实际使用数量（不能超过授权数量）
            actual_workspaces = random.randint(0, workspaces)
            actual_users = random.randint(0, users)
            
            # 部署状态
            if license_status == "ACTIVE":
                deployment_status = random.choices(
                    ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
                    weights=[0.1, 0.2, 0.65, 0.05]
                )[0]
            else:
                deployment_status = "PLANNED"

            # 创建许可证
            license_id = f"LIC-{fake.hexify(text='^^^^^^')}-{len(customers)+i+1}"
            license = License(
                license_id=license_id,
                customer_id=customer.customer_id,
                sales_rep_id=sales_rep.sales_rep_id if sales_rep else None,
                reseller_id=reseller.reseller_id if reseller else None,
                product_name="Dify Enterprise",
                product_version=random.choice(["1.0", "1.5", "2.0", "2.1"]),
                license_type=random.choice(LICENSE_TYPES),
                order_date=order_date,
                start_date=start_date,
                expiry_date=expiry_date,
                authorized_workspaces=workspaces,
                authorized_users=users,
                actual_workspaces=actual_workspaces,
                actual_users=actual_users,
                deployment_status=deployment_status,
                deployment_date=start_date + timedelta(days=random.randint(1, 30)) if deployment_status != "PLANNED" else None,
                license_status=license_status,
                last_check_date=today - timedelta(days=random.randint(0, 30)) if license_status == "ACTIVE" else None,
                notes=fake.paragraph() if random.random() > 0.7 else None
            )
            db.add(license)
            licenses.append(license)
    
    db.commit()
    print(f"已创建 {len(licenses)} 个许可证")
    return licenses

def create_purchase_records(db: Session, licenses, count: int = 50):
    """创建购买记录"""
    purchase_records = []
    
    # 确保每个许可证至少有一条购买记录（对应最初购买）
    for license in licenses:
        purchase_record = PurchaseRecord(
            license_id=license.license_id,
            purchase_type="NEW",
            purchase_date=license.order_date,
            order_number=f"ORD-{fake.hexify(text='######')}",
            contract_number=f"CNT-{fake.hexify(text='######')}",
            amount=random.uniform(5000, 50000),
            currency="CNY",
            payment_status=random.choices(
                ['PENDING', 'PAID', 'REFUNDED', 'CANCELLED'],
                weights=[0.1, 0.8, 0.05, 0.05]
            )[0],
            payment_date=license.order_date + timedelta(days=random.randint(1, 15)) if random.random() > 0.2 else None,
            workspaces_purchased=license.authorized_workspaces,
            users_purchased=license.authorized_users,
            notes=fake.text(max_nb_chars=100) if random.random() > 0.8 else None
        )
        db.add(purchase_record)
        purchase_records.append(purchase_record)
    
    # 添加额外的购买记录（升级、续费等）
    extra_count = count - len(licenses)
    if extra_count > 0:
        for _ in range(extra_count):
            license = random.choice(licenses)
            
            # 确保这是不是NEW类型（因为每个许可证已经有一个NEW类型的记录）
            purchase_type = random.choice(["RENEWAL", "UPGRADE", "EXPANSION"])
            
            # 购买日期在许可证订单日期之后
            days_after = random.randint(30, 300)
            purchase_date = license.order_date + timedelta(days=days_after)
            
            # 对于RENEWAL类型，设置之前的过期日期和新过期日期
            previous_expiry_date = None
            new_expiry_date = None
            if purchase_type == "RENEWAL":
                previous_expiry_date = license.expiry_date
                new_expiry_date = previous_expiry_date + timedelta(days=365)
            
            # 工作区和用户增量
            workspaces_change = random.randint(0, 5)
            users_change = random.randint(0, 20)
            
            purchase_record = PurchaseRecord(
                license_id=license.license_id,
                purchase_type=purchase_type,
                purchase_date=purchase_date,
                order_number=f"ORD-{fake.hexify(text='######')}",
                contract_number=f"CNT-{fake.hexify(text='######')}",
                amount=random.uniform(2000, 30000),
                currency="CNY",
                payment_status=random.choices(
                    ['PENDING', 'PAID', 'REFUNDED', 'CANCELLED'],
                    weights=[0.1, 0.8, 0.05, 0.05]
                )[0],
                payment_date=purchase_date + timedelta(days=random.randint(1, 15)) if random.random() > 0.2 else None,
                workspaces_purchased=workspaces_change,
                users_purchased=users_change,
                previous_expiry_date=previous_expiry_date,
                new_expiry_date=new_expiry_date,
                notes=fake.text(max_nb_chars=100) if random.random() > 0.8 else None
            )
            db.add(purchase_record)
            purchase_records.append(purchase_record)
    
    db.commit()
    print(f"已创建 {len(purchase_records)} 条购买记录")
    return purchase_records

def create_deployment_records(db: Session, licenses, engineers, count: int = 40):
    """创建部署记录"""
    deployment_records = []
    
    # 为每个已完成部署的许可证创建部署记录
    completed_licenses = [lic for lic in licenses if lic.deployment_status == "COMPLETED"]
    for license in completed_licenses:
        deployment_record = DeploymentRecord(
            license_id=license.license_id,
            deployment_type="INITIAL",
            deployment_date=license.deployment_date or (license.start_date + timedelta(days=random.randint(1, 20))),
            deployed_by=random.choice(["客户IT", "厂商工程师", "合作伙伴"]),
            deployment_status="COMPLETED",
            deployment_environment=random.choice(["生产环境", "测试环境", "预发布环境", "开发环境"]),
            server_info=fake.text(max_nb_chars=100) if random.random() > 0.3 else None,
            completion_date=license.deployment_date + timedelta(days=random.randint(1, 5)) if license.deployment_date else None,
            notes=fake.text(max_nb_chars=100) if random.random() > 0.7 else None
        )
        db.add(deployment_record)
        deployment_records.append(deployment_record)
    
    # 为进行中的部署创建记录
    in_progress_licenses = [lic for lic in licenses if lic.deployment_status == "IN_PROGRESS"]
    for license in in_progress_licenses:
        deployment_record = DeploymentRecord(
            license_id=license.license_id,
            deployment_type="INITIAL",
            deployment_date=license.deployment_date or (license.start_date + timedelta(days=random.randint(1, 20))),
            deployed_by=random.choice(["客户IT", "厂商工程师", "合作伙伴"]),
            deployment_status="IN_PROGRESS",
            deployment_environment=random.choice(["生产环境", "测试环境", "预发布环境", "开发环境"]),
            server_info=fake.text(max_nb_chars=100) if random.random() > 0.3 else None,
            notes=fake.text(max_nb_chars=100) if random.random() > 0.7 else None
        )
        db.add(deployment_record)
        deployment_records.append(deployment_record)
    
    # 为计划部署创建一些记录
    planned_licenses = [lic for lic in licenses if lic.deployment_status == "PLANNED"]
    for license in random.sample(planned_licenses, min(len(planned_licenses), 5)):
        future_date = date.today() + timedelta(days=random.randint(5, 30))
        deployment_record = DeploymentRecord(
            license_id=license.license_id,
            deployment_type="INITIAL",
            deployment_date=future_date,
            deployed_by=random.choice(["客户IT", "厂商工程师", "合作伙伴"]),
            deployment_status="PLANNED",
            deployment_environment=random.choice(["生产环境", "测试环境", "预发布环境", "开发环境"]),
            notes=fake.text(max_nb_chars=100) if random.random() > 0.7 else None
        )
        db.add(deployment_record)
        deployment_records.append(deployment_record)
    
    # 创建一些升级部署记录
    completed_deployments = [depl for depl in deployment_records if depl.deployment_status == "COMPLETED"]
    for _ in range(min(10, len(completed_deployments))):
        original_deployment = random.choice(completed_deployments)
        upgrade_date = original_deployment.completion_date + timedelta(days=random.randint(30, 180))
        
        if upgrade_date > date.today():
            continue
            
        deployment_record = DeploymentRecord(
            license_id=original_deployment.license_id,
            deployment_type=random.choice(["UPDATE", "MIGRATION"]),
            deployment_date=upgrade_date,
            deployed_by=random.choice(["客户IT", "厂商工程师", "合作伙伴"]),
            deployment_status="COMPLETED",
            deployment_environment=original_deployment.deployment_environment,
            server_info=original_deployment.server_info,
            completion_date=upgrade_date + timedelta(days=random.randint(1, 3)),
            notes=fake.text(max_nb_chars=100) if random.random() > 0.7 else None
        )
        db.add(deployment_record)
        deployment_records.append(deployment_record)
    
    db.commit()
    print(f"已创建 {len(deployment_records)} 条部署记录")
    
    # 为部署分配工程师
    for deployment in deployment_records:
        # 随机分配1-3个工程师
        num_engineers = random.randint(1, min(3, len(engineers)))
        selected_engineers = random.sample(engineers, num_engineers)
        
        for engineer in selected_engineers:
            role = random.choice(["部署工程师", "数据库工程师", "系统架构师", "网络工程师", "项目负责人"])
            deployment_engineer = DeploymentEngineer(
                deployment_id=deployment.deployment_id,
                engineer_id=engineer.engineer_id,
                role=role
            )
            db.add(deployment_engineer)
    
    db.commit()
    print(f"已为部署记录分配工程师")
    
    return deployment_records

def create_change_tracking(db: Session, count: int = 30):
    """创建变更记录"""
    tables = ["licenses", "customers", "sales_reps", "deployment_records"]
    fields = {
        "licenses": ["license_status", "authorized_users", "authorized_workspaces", "expiry_date"],
        "customers": ["contact_person", "contact_email", "contact_phone", "address"],
        "sales_reps": ["department", "position", "status"],
        "deployment_records": ["deployment_status", "deployment_environment", "completion_date"]
    }
    
    for _ in range(count):
        table = random.choice(tables)
        field = random.choice(fields[table])
        
        if field in ["authorized_users", "authorized_workspaces"]:
            old_value = str(random.randint(1, 10))
            new_value = str(int(old_value) + random.randint(1, 5))
        elif field == "expiry_date":
            old_value = (date.today() - timedelta(days=random.randint(30, 365))).isoformat()
            new_value = (date.today() + timedelta(days=random.randint(30, 365))).isoformat()
        elif field == "license_status":
            old_value = "PENDING"
            new_value = "ACTIVE"
        elif field == "deployment_status":
            old_value = "PLANNED"
            new_value = "IN_PROGRESS"
        elif field == "completion_date":
            old_value = ""
            new_value = date.today().isoformat()
        else:
            old_value = fake.word()
            new_value = fake.word()
        
        change = ChangeTracking(
            table_name=table,
            record_id=str(random.randint(1, 100)) if table != "licenses" else f"LIC-{fake.hexify(text='^^^^^^')}",
            field_name=field,
            old_value=old_value,
            new_value=new_value,
            changed_by=fake.name(),
            change_reason=fake.text(max_nb_chars=100) if random.random() > 0.5 else None
        )
        db.add(change)
    
    db.commit()
    print(f"已创建 {count} 条变更记录")

def main():
    """主函数，生成所有测试数据"""
    db = SessionLocal()
    try:
        print("开始生成测试数据...")
        
        # 创建基础数据
        customers = create_customers(db, 20)
        sales_reps = create_sales_reps(db, 10)
        resellers = create_resellers(db, 5)
        engineers = create_engineers(db, 8)
        
        # 创建许可证数据
        licenses = create_licenses(db, customers, sales_reps, resellers, 30)
        
        # 创建关联记录
        create_purchase_records(db, licenses, 50)
        create_deployment_records(db, licenses, engineers, 40)
        create_change_tracking(db, 30)
        
        print("测试数据生成完成!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
