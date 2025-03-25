"""
迁移工程师模型字段数据脚本
从 specialization 迁移到 expertise 字段
"""
from sqlalchemy import inspect, Column, String
from sqlalchemy.sql import text
from app.db.database import engine, get_db, SessionLocal

def migrate_data():
    # 获取数据库连接
    db = SessionLocal()
    inspector = inspect(engine)
    
    try:
        # 检查专业技能字段是否存在
        columns = inspector.get_columns('factory_engineers')
        column_names = [c['name'] for c in columns]
        
        # 如果还没有expertise字段，需要先添加
        if 'expertise' not in column_names:
            print("添加expertise字段")
            with engine.connect() as conn:
                conn.execute(text(
                    "ALTER TABLE factory_engineers ADD COLUMN expertise VARCHAR(255)"
                ))
                conn.commit()
        
        # 如果specialization字段存在，复制数据到expertise
        if 'specialization' in column_names:
            print("从specialization迁移数据到expertise")
            with engine.connect() as conn:
                conn.execute(text(
                    "UPDATE factory_engineers SET expertise = specialization WHERE expertise IS NULL"
                ))
                conn.commit()
            
            # 确认数据已经迁移完成后，可以删除旧字段(可选)
            # 请确认数据迁移完成后再取消下面这段注释
            # print("移除specialization字段")
            # with engine.connect() as conn:
            #     conn.execute(text(
            #         "ALTER TABLE factory_engineers DROP COLUMN specialization"
            #     ))
            #     conn.commit()
        
        # 检查并处理销售人员部门字段
        sales_columns = inspector.get_columns('sales_reps')
        sales_column_names = [c['name'] for c in sales_columns]
        
        if 'salesperson_type' not in sales_column_names:
            print("添加salesperson_type字段")
            with engine.connect() as conn:
                conn.execute(text(
                    "ALTER TABLE sales_reps ADD COLUMN salesperson_type VARCHAR(255)"
                ))
                conn.commit()
        
        if 'department' in sales_column_names:
            print("从department迁移数据到salesperson_type")
            with engine.connect() as conn:
                conn.execute(text(
                    "UPDATE sales_reps SET salesperson_type = department WHERE salesperson_type IS NULL"
                ))
                conn.commit()
            
            # 确认数据已经迁移完成后，可以删除旧字段(可选)
            # print("移除department字段")
            # with engine.connect() as conn:
            #     conn.execute(text(
            #         "ALTER TABLE sales_reps DROP COLUMN department"
            #     ))
            #     conn.commit()
        
        print("数据迁移完成")
        
    except Exception as e:
        print(f"迁移过程中发生错误: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_data()
