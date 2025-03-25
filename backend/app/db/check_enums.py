"""
Script to check database enum values
"""
from sqlalchemy import text
from app.db.database import engine

def check_enum_values():
    """Check enum values in the database"""
    with engine.connect() as conn:
        # Query to get enum values for order_status_enum
        result = conn.execute(text("""
            SELECT 
                COLUMN_TYPE 
            FROM 
                INFORMATION_SCHEMA.COLUMNS 
            WHERE 
                TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'orders' 
                AND COLUMN_NAME = 'status'
        """))
        
        row = result.fetchone()
        if row:
            print(f"Order status enum values: {row[0]}")
        else:
            print("Could not find order status enum values")
            
        # Let's try to insert an order with a different status value
        statuses = ["pending", "approved", "rejected", "completed", "Pending", "Approved", "p", "a", "r", "c"]
        
        for status in statuses:
            try:
                # Try inserting with this status
                conn.execute(text("""
                    INSERT INTO orders (
                        order_id, 
                        customer_id, 
                        order_number, 
                        order_date, 
                        total_amount, 
                        status, 
                        notes,
                        created_at,
                        updated_at
                    ) VALUES (
                        :order_id,
                        1,
                        :order_number,
                        CURDATE(),
                        1000.0,
                        :status,
                        :notes,
                        NOW(),
                        NOW()
                    )
                """), {
                    "order_id": f"test-{status}",
                    "order_number": f"ORD-TEST-{status.upper()}",
                    "status": status,
                    "notes": f"Testing with status {status}"
                })
                
                print(f"Successfully inserted order with status '{status}'")
                
                # Clean up this test order
                conn.execute(text("""
                    DELETE FROM orders WHERE order_id = :order_id
                """), {"order_id": f"test-{status}"})
                
            except Exception as e:
                print(f"Failed to insert order with status '{status}': {e}")
                
        # Commit any successful test inserts
        conn.commit()

if __name__ == "__main__":
    check_enum_values()
