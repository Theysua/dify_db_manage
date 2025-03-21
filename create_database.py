import mysql.connector
import os
import sys

# Database connection details
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = ''
DB_NAME = 'dify_sales'

def create_database():
    # First, create a connection without selecting a database
    conn = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cursor = conn.cursor()
    
    # Drop the database if it exists
    cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
    print(f"Database '{DB_NAME}' dropped if it existed")
    
    # Create the database
    cursor.execute(f"CREATE DATABASE {DB_NAME}")
    print(f"Database '{DB_NAME}' created successfully")
    
    # Connect to the database
    conn.database = DB_NAME
    
    # Read SQL statements from mian.py file
    with open('mian.py', 'r') as file:
        sql_script = file.read()
    
    # Split the script into separate SQL statements by finding all CREATE TABLE statements
    import re
    
    # Find all complete SQL statements using regular expressions
    # This should handle multi-line statements better than simple split
    statements = []
    
    # Get CREATE TABLE statements
    table_statements = re.findall(r'CREATE TABLE[^;]+;', sql_script, re.DOTALL)
    statements.extend(table_statements)
    
    # Get CREATE INDEX statements
    index_statements = re.findall(r'CREATE INDEX[^;]+;', sql_script, re.DOTALL)
    statements.extend(index_statements)
    
    # Execute each statement
    success_count = 0
    error_count = 0
    for statement in statements:
        # Skip empty statements
        if statement.strip():
            try:
                cursor.execute(statement)
                success_count += 1
                print(f"Successfully executed statement: {statement.split('(')[0].strip()}")
            except mysql.connector.Error as err:
                error_count += 1
                print(f"Error executing statement: {err}")
                print(f"Statement: {statement.split('(')[0].strip()}")
    
    # Commit changes
    conn.commit()
    
    # Close connection
    cursor.close()
    conn.close()
    
    print(f"\nDatabase creation complete!")
    print(f"Successfully executed statements: {success_count}")
    print(f"Failed statements: {error_count}")

if __name__ == "__main__":
    create_database()
