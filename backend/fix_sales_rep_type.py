"""
修复销售代表类型字段的数据
将不符合枚举值的数据修正为默认值"其他"
"""
from sqlalchemy import text
from app.db.database import engine, SessionLocal

def fix_sales_rep_types():
    db = SessionLocal()
    
    try:
        # 查询所有不在枚举值范围的销售人员类型
        with engine.connect() as conn:
            # 枚举值列表
            valid_types = ['解决方案架构师', 'FDE', '商业化内部运营', '其他']
            valid_types_str = "', '".join(valid_types)
            
            # 先查询有问题的记录
            query = f"""
            SELECT sales_rep_id, sales_rep_name, salesperson_type 
            FROM sales_reps 
            WHERE salesperson_type NOT IN ('{valid_types_str}')
            """
            
            result = conn.execute(text(query))
            invalid_records = result.fetchall()
            
            if invalid_records:
                print(f"发现 {len(invalid_records)} 条无效的销售人员类型记录:")
                for record in invalid_records:
                    print(f"ID: {record[0]}, 姓名: {record[1]}, 当前类型: {record[2]}")
                
                # 更新这些记录
                update_query = f"""
                UPDATE sales_reps 
                SET salesperson_type = '其他' 
                WHERE salesperson_type NOT IN ('{valid_types_str}')
                """
                
                conn.execute(text(update_query))
                conn.commit()
                print("已将所有无效类型更新为'其他'")
            else:
                print("没有发现无效的销售人员类型记录")
    
    except Exception as e:
        print(f"修复过程中发生错误: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_sales_rep_types()
