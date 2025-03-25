import sys
import os
import random
from sqlalchemy import text
from datetime import datetime

# Add the backend directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.database import get_db

# List of potential customer names
company_names = [
    "TechFirst Corp", "Digital Solutions Ltd", "Innovate AI", "Smart Systems",
    "DataDriven Inc", "Future Technologies", "Intelligent Networks", "Synergy Tech",
    "OpenAI Partners", "Quantum Computing Co", "Cloud Pioneers", "DevOps Masters",
    "ML Experts Group", "Enterprise Solutions", "Global Tech Alliance"
]

# List of potential cities
cities = [
    "Shanghai", "Beijing", "Shenzhen", "Guangzhou", "Hangzhou", "Nanjing", 
    "Chengdu", "Wuhan", "Tianjin", "Xi'an", "Suzhou", "Chongqing", 
    "Qingdao", "Dalian", "Ningbo", "Xiamen", "Zhengzhou", "Changsha"
]

# List of potential industries
industries = [
    "Technology", "Finance", "Healthcare", "Manufacturing", 
    "Education", "Retail", "Energy", "Transportation",
    "Telecommunications", "Entertainment", "Real Estate", "Consulting"
]

def create_customers():
    """Create mock customers in the database"""
    db = next(get_db())
    
    # Check if customers already exist
    existing_customers = db.execute(text("SELECT COUNT(*) FROM customers")).scalar()
    if existing_customers > 0:
        print(f"Found {existing_customers} existing customers. Skipping creation.")
        return existing_customers
    
    # Get all partner IDs from the database
    partner_ids = [row[0] for row in db.execute(text("SELECT partner_id FROM partners")).fetchall()]
    
    if not partner_ids:
        print("No partners found. Please create partners first.")
        return 0
    
    print(f"Found {len(partner_ids)} partners. Creating customers...")
    
    # Create 2-5 customers for each partner
    for partner_id in partner_ids:
        num_customers = random.randint(2, 5)
        
        for i in range(num_customers):
            company_name = random.choice(company_names) + f" {random.randint(100, 999)}"
            contact_name = f"Contact {random.randint(1, 100)}"
            city = random.choice(cities)
            industry = random.choice(industries)
            
            # Insert customer directly with SQL
            db.execute(
                text("""
                INSERT INTO customers 
                (customer_name, contact_person, contact_email, contact_phone, 
                address, industry, customer_type, region, created_at, updated_at) 
                VALUES (:name, :contact, :email, :phone, :address, :industry, 
                :customer_type, :region, NOW(), NOW())
                """),
                {
                    "name": company_name,
                    "contact": contact_name,
                    "email": f"contact{random.randint(1, 1000)}@{company_name.replace(' ', '').lower()}.com",
                    "phone": f"+86 {random.randint(130, 199)}{random.randint(10000000, 99999999)}",
                    "address": f"{random.randint(1, 999)} {city} Road, {city}",
                    "industry": industry,
                    "customer_type": random.choice(["SMB", "Enterprise", "Government"]),
                    "region": city
                }
            )
        
    db.commit()
    
    # Verify customers were created
    customer_count = db.execute(text("SELECT COUNT(*) FROM customers")).scalar()
    print(f"Successfully created {customer_count} customers.")
    return customer_count

if __name__ == "__main__":
    create_customers()
