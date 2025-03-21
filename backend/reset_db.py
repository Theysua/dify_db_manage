"""
Script to reset and recreate the database schema
"""
import mysql.connector
from app.core.config import settings
from app.db.database import engine, Base
from app.models.models import *  # Import all models

def reset_database():
    # Connect to MySQL server without specifying a database
    conn = mysql.connector.connect(
        host=settings.MYSQL_HOST,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        port=settings.MYSQL_PORT
    )
    
    cursor = conn.cursor()
    
    try:
        # Drop database if it exists
        cursor.execute(f"DROP DATABASE IF EXISTS {settings.MYSQL_DB}")
        print(f"Dropped database {settings.MYSQL_DB} if it existed")
        
        # Create database
        cursor.execute(f"CREATE DATABASE {settings.MYSQL_DB}")
        print(f"Created database {settings.MYSQL_DB}")
        
        # Create MySQL database with charset and collation
        cursor.execute(f"ALTER DATABASE {settings.MYSQL_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        
        print("Database reset complete")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
        conn.close()
    
    # Create all tables using SQLAlchemy
    try:
        # Drop all existing tables
        Base.metadata.drop_all(bind=engine)
        print("Dropped all existing tables")
        
        # Create tables in order
        Base.metadata.create_all(bind=engine)
        print("Created all tables")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    reset_database()
