import sys
import os
import random
from sqlalchemy.orm import Session

# Add the backend directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.database import get_db
from app.models.partner_models import Customer

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
    existing_customers = db.query(Customer).count()
    if existing_customers > 0:
        print(f"Found {existing_customers} existing customers. Skipping creation.")
        return
    
    # Get all partner IDs from the database
    partner_ids = [row[0] for row in db.execute("SELECT partner_id FROM partners").fetchall()]
    
    if not partner_ids:
        print("No partners found. Please create partners first.")
        return
    
    print(f"Found {len(partner_ids)} partners. Creating customers...")
    
    # Create 2-5 customers for each partner
    for partner_id in partner_ids:
        num_customers = random.randint(2, 5)
        
        for i in range(num_customers):
            company_name = random.choice(company_names) + f" {random.randint(100, 999)}"
            contact_name = f"Contact {random.randint(1, 100)}"
            city = random.choice(cities)
            industry = random.choice(industries)
            
            customer = Customer(
                partner_id=partner_id,
                customer_name=company_name,
                contact_person=contact_name,
                contact_email=f"contact{random.randint(1, 1000)}@{company_name.replace(' ', '').lower()}.com",
                contact_phone=f"+86 {random.randint(130, 199)}{random.randint(10000000, 99999999)}",
                address=f"{random.randint(1, 999)} {city} Road, {city}",
                industry=industry,
                company_size=random.choice(["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]),
                region=city
            )
            
            db.add(customer)
        
    db.commit()
    
    # Verify customers were created
    customer_count = db.query(Customer).count()
    print(f"Successfully created {customer_count} customers.")

if __name__ == "__main__":
    create_customers()
