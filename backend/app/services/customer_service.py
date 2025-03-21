from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, date

from app.models.models import Customer, License
from app.schemas import schemas


class CustomerService:
    @staticmethod
    def create_customer(db: Session, customer_data: schemas.CustomerCreate) -> Customer:
        """Create a new customer record"""
        # Create the customer record with lowercase attribute names
        db_customer = Customer(
            customer_name=customer_data.CustomerName,
            contact_person=customer_data.ContactPerson,
            contact_email=customer_data.ContactEmail,
            contact_phone=customer_data.ContactPhone,
            address=customer_data.Address,
            industry=customer_data.Industry,
            customer_type=customer_data.CustomerType,
            region=customer_data.Region,
            notes=customer_data.Notes
        )
        
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        
        return db_customer

    @staticmethod
    def get_customer(db: Session, customer_id: int) -> Optional[schemas.CustomerInfo]:
        """Get detailed information about a specific customer"""
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        
        if not customer:
            return None
            
        return schemas.CustomerInfo(
            CustomerID=customer.customer_id,
            CustomerName=customer.customer_name,
            ContactPerson=customer.contact_person,
            ContactEmail=customer.contact_email,
            ContactPhone=customer.contact_phone,
            Address=customer.address,
            Industry=customer.industry,
            CustomerType=customer.customer_type,
            Region=customer.region,
            Notes=customer.notes,
            CreatedAt=customer.created_at,
            UpdatedAt=customer.updated_at
        )

    @staticmethod
    def get_customers(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        name_filter: Optional[str] = None,
        industry: Optional[str] = None,
        region: Optional[str] = None,
        customer_type: Optional[str] = None
    ) -> List[schemas.CustomerInfo]:
        """Get list of customers with filtering options"""
        query = db.query(Customer)
        
        # Apply filters
        if name_filter:
            query = query.filter(Customer.customer_name.ilike(f"%{name_filter}%"))
        if industry:
            query = query.filter(Customer.industry == industry)
        if region:
            query = query.filter(Customer.region == region)
        if customer_type:
            query = query.filter(Customer.customer_type == customer_type)
        
        # Apply pagination
        customers = query.order_by(Customer.customer_name).offset(skip).limit(limit).all()
        
        # Convert to schema model
        return [
            schemas.CustomerInfo(
                CustomerID=customer.customer_id,
                CustomerName=customer.customer_name,
                ContactPerson=customer.contact_person,
                ContactEmail=customer.contact_email,
                ContactPhone=customer.contact_phone,
                Address=customer.address,
                Industry=customer.industry,
                CustomerType=customer.customer_type,
                Region=customer.region,
                Notes=customer.notes,
                CreatedAt=customer.created_at,
                UpdatedAt=customer.updated_at
            )
            for customer in customers
        ]

    @staticmethod
    def update_customer(
        db: Session, 
        customer_id: int, 
        customer_data: schemas.CustomerUpdate
    ) -> Optional[schemas.CustomerInfo]:
        """Update customer information"""
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        
        if not customer:
            return None
        
        # Update fields if provided
        update_data = customer_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                # Convert CamelCase to snake_case for database column names
                db_key = ''.join(['_' + c.lower() if c.isupper() else c for c in key]).lstrip('_')
                setattr(customer, db_key, value)
        
        # Update the last modified date
        customer.updated_at = datetime.now()
        
        db.commit()
        db.refresh(customer)
        
        # Return the updated customer
        return schemas.CustomerInfo(
            CustomerID=customer.customer_id,
            CustomerName=customer.customer_name,
            ContactPerson=customer.contact_person,
            ContactEmail=customer.contact_email,
            ContactPhone=customer.contact_phone,
            Address=customer.address,
            Industry=customer.industry,
            CustomerType=customer.customer_type,
            Region=customer.region,
            Notes=customer.notes,
            CreatedAt=customer.created_at,
            UpdatedAt=customer.updated_at
        )

    @staticmethod
    def delete_customer(db: Session, customer_id: int) -> bool:
        """Delete a customer (will cascade to licenses)"""
        customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
        
        if not customer:
            return False
        
        db.delete(customer)
        db.commit()
        
        return True
    
    @staticmethod
    def get_customer_licenses(db: Session, customer_id: int, skip: int = 0, limit: int = 100) -> List[schemas.LicenseInfo]:
        """Get all licenses for a specific customer"""
        licenses = db.query(License)\
            .filter(License.customer_id == customer_id)\
            .order_by(License.created_at.desc())\
            .offset(skip).limit(limit).all()
            
        # Convert to schema model
        return [
            schemas.LicenseInfo(
                LicenseID=license.license_id,
                CustomerID=license.customer_id,
                SalesRepID=license.sales_rep_id,
                ResellerID=license.reseller_id,
                ProductName=license.product_name,
                ProductVersion=license.product_version,
                LicenseType=license.license_type,
                OrderDate=license.order_date,
                StartDate=license.start_date,
                ExpiryDate=license.expiry_date,
                AuthorizedWorkspaces=license.authorized_workspaces,
                AuthorizedUsers=license.authorized_users,
                ActualWorkspaces=license.actual_workspaces,
                ActualUsers=license.actual_users,
                DeploymentStatus=license.deployment_status,
                DeploymentDate=license.deployment_date,
                LicenseStatus=license.license_status,
                LastCheckDate=license.last_check_date,
                Notes=license.notes,
                CreatedAt=license.created_at,
                UpdatedAt=license.updated_at
            )
            for license in licenses
        ]
    
    @staticmethod
    def get_customer_statistics(db: Session) -> schemas.CustomerStatistics:
        """Get statistics for customers"""
        today = datetime.now().date()
        month_start = date(today.year, today.month, 1)
        
        # Total customers
        total_customers = db.query(func.count(Customer.customer_id)).scalar()
        
        # Active customers (with at least one active license)
        active_customers = db.query(func.count(Customer.customer_id.distinct()))\
            .join(License, Customer.customer_id == License.customer_id)\
            .filter(License.license_status == "ACTIVE")\
            .scalar()
        
        # Inactive customers (no active licenses)
        inactive_customers = total_customers - active_customers
        
        # New customers this month
        new_customers_this_month = db.query(func.count(Customer.customer_id))\
            .filter(Customer.created_at >= month_start)\
            .scalar()
        
        # Customers by region
        regions = db.query(
                Customer.region, 
                func.count(Customer.customer_id).label("count")
            )\
            .filter(Customer.region.isnot(None))\
            .group_by(Customer.region)\
            .all()
        
        customers_by_region = {region: count for region, count in regions}
        
        # Customers by industry
        industries = db.query(
                Customer.industry, 
                func.count(Customer.customer_id).label("count")
            )\
            .filter(Customer.industry.isnot(None))\
            .group_by(Customer.industry)\
            .all()
        
        customers_by_industry = {industry: count for industry, count in industries}
        
        return schemas.CustomerStatistics(
            TotalCustomers=total_customers,
            ActiveCustomers=active_customers,
            InactiveCustomers=inactive_customers,
            NewCustomersThisMonth=new_customers_this_month,
            CustomersByRegion=customers_by_region,
            CustomersByIndustry=customers_by_industry
        )
