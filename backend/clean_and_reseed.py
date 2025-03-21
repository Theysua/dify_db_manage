import os
import sys
from sqlalchemy import inspect, delete

# 将当前目录添加到PATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入数据库连接和模型
from app.db.database import SessionLocal, engine, Base
from app.models.models import (
    Customer, SalesRep, Reseller, License, PurchaseRecord,
    FactoryEngineer, DeploymentRecord, DeploymentEngineer, ChangeTracking
)
# 导入测试数据生成模块
from app.test_data import main

def clean_all_data():
    """清理数据库中的所有数据"""
    db = SessionLocal()
    try:
        print("开始清理数据库...")
        
        # 按照依赖关系顺序删除数据
        print("删除变更记录...")
        db.execute(delete(ChangeTracking))
        
        print("删除部署工程师分配...")
        db.execute(delete(DeploymentEngineer))
        
        print("删除部署记录...")
        db.execute(delete(DeploymentRecord))
        
        print("删除购买记录...")
        db.execute(delete(PurchaseRecord))
        
        print("删除许可证...")
        db.execute(delete(License))
        
        print("删除工程师...")
        db.execute(delete(FactoryEngineer))
        
        print("删除客户...")
        db.execute(delete(Customer))
        
        print("删除销售代表...")
        db.execute(delete(SalesRep))
        
        print("删除经销商...")
        db.execute(delete(Reseller))
        
        db.commit()
        print("数据库清理完成！")
    except Exception as e:
        db.rollback()
        print(f"清理数据库时出错: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # 清理所有数据
    clean_all_data()
    
    # 重新生成测试数据
    main()
