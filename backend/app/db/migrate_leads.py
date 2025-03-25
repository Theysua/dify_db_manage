"""
商机管理模块数据库迁移脚本
用于创建和初始化商机管理相关的表结构
"""

import os
import sys
import logging
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.sql import func
from datetime import datetime
import pymysql

# 添加项目根目录到Python路径
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.core.config import settings
from app.models.lead_models import LeadSource, LeadStatus, Lead, LeadActivity
from app.models.models import SalesRep, Customer, License
from app.models.partner_models import Partner
from app.db.database import Base

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_engine():
    """获取数据库连接引擎"""
    return create_engine(settings.DATABASE_URI)

def drop_tables():
    """删除已存在的商机相关表（如需重新创建）"""
    engine = get_engine()
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # 商机相关表名
    lead_tables = ['lead_activities', 'leads', 'lead_statuses', 'lead_sources']
    
    with engine.connect() as conn:
        # 暂时禁用外键约束检查
        conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        
        for table in lead_tables:
            if table in existing_tables:
                logger.info(f"删除表: {table}")
                conn.execute(text(f"DROP TABLE IF EXISTS {table}"))
        
        # 恢复外键约束检查
        conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))
        conn.commit()

def ensure_dependency_tables():
    """确保依赖表已存在"""
    engine = get_engine()
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # 检查并创建依赖表
    dependency_tables = [
        SalesRep.__table__,
        Partner.__table__
    ]
    
    for table in dependency_tables:
        if table.name not in existing_tables:
            try:
                logger.info(f"创建依赖表: {table.name}")
                table.create(engine)
            except Exception as e:
                logger.warning(f"创建依赖表 {table.name} 失败: {e}")
                # 不抛出异常，继续尝试其他表

def create_tables():
    """创建商机相关表"""
    engine = get_engine()
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # 先确保依赖表存在
    ensure_dependency_tables()
    
    # 创建商机相关表
    tables_to_create = [
        LeadSource.__table__,
        LeadStatus.__table__,
        Lead.__table__,
        LeadActivity.__table__
    ]
    
    created_tables = []
    for table in tables_to_create:
        if table.name not in existing_tables:
            try:
                table.create(engine)
                created_tables.append(table.name)
                logger.info(f"创建表: {table.name}")
            except Exception as e:
                logger.error(f"创建表 {table.name} 失败: {e}")
                raise
    
    return created_tables

def insert_initial_data():
    """插入初始数据"""
    engine = get_engine()
    
    # 定义初始商机来源
    initial_sources = [
        {"source_name": "网站", "description": "通过官方网站表单提交"},
        {"source_name": "电话咨询", "description": "通过电话咨询"},
        {"source_name": "合作伙伴推荐", "description": "由合作伙伴引荐"},
        {"source_name": "展会", "description": "在展会上获取的潜在客户"},
        {"source_name": "社交媒体", "description": "通过社交媒体平台"},
        {"source_name": "邮件营销", "description": "通过邮件营销活动"},
        {"source_name": "老客户推荐", "description": "由现有客户推荐"}
    ]
    
    # 定义初始商机状态
    initial_statuses = [
        {"status_name": "初步接触", "description": "初步接触阶段", "display_order": 1},
        {"status_name": "需求确认", "description": "确认客户需求阶段", "display_order": 2},
        {"status_name": "方案制定", "description": "正在制定解决方案", "display_order": 3},
        {"status_name": "已提交方案", "description": "方案已提交给客户", "display_order": 4},
        {"status_name": "商务谈判", "description": "正在进行商务谈判", "display_order": 5},
        {"status_name": "合同签署", "description": "合同签署阶段", "display_order": 6},
        {"status_name": "已赢单", "description": "商机已转化为订单", "display_order": 7},
        {"status_name": "已输单", "description": "商机失败", "display_order": 8},
        {"status_name": "搁置", "description": "商机暂时搁置", "display_order": 9}
    ]
    
    # 插入商机来源数据
    with engine.connect() as conn:
        for source in initial_sources:
            try:
                # 检查是否已存在
                result = conn.execute(
                    text("SELECT source_id FROM lead_sources WHERE source_name = :source_name"),
                    {"source_name": source["source_name"]}
                ).fetchone()
                
                if not result:
                    conn.execute(
                        text("""
                            INSERT INTO lead_sources 
                            (source_name, description, is_active, created_at, updated_at) 
                            VALUES (:source_name, :description, TRUE, NOW(), NOW())
                        """),
                        source
                    )
                    logger.info(f"插入商机来源: {source['source_name']}")
            except Exception as e:
                logger.error(f"插入商机来源失败 {source['source_name']}: {e}")
        
        # 插入商机状态数据
        for status in initial_statuses:
            try:
                # 检查是否已存在
                result = conn.execute(
                    text("SELECT status_id FROM lead_statuses WHERE status_name = :status_name"),
                    {"status_name": status["status_name"]}
                ).fetchone()
                
                if not result:
                    conn.execute(
                        text("""
                            INSERT INTO lead_statuses 
                            (status_name, description, display_order, is_active, created_at, updated_at) 
                            VALUES (:status_name, :description, :display_order, TRUE, NOW(), NOW())
                        """),
                        status
                    )
                    logger.info(f"插入商机状态: {status['status_name']}")
            except Exception as e:
                logger.error(f"插入商机状态失败 {status['status_name']}: {e}")
        
        conn.commit()

def main():
    """执行数据库迁移"""
    try:
        logger.info("开始商机管理模块数据库迁移...")
        
        # 是否需要删除并重建表
        rebuild_tables = input("是否删除并重建商机相关表? (yes/no): ").lower() == 'yes'
        
        if rebuild_tables:
            drop_tables()
            logger.info("已删除商机相关表")
        
        # 创建表，自动确保依赖表存在
        created_tables = create_tables()
        
        if created_tables or rebuild_tables:
            # 插入初始数据
            insert_initial_data()
            logger.info("初始数据已插入")
        
        logger.info("商机管理模块数据库迁移完成")
    except Exception as e:
        logger.error(f"数据库迁移失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
