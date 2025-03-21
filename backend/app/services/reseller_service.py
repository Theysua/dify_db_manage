from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.models import Reseller, License, PurchaseRecord
from app.schemas import schemas


class ResellerService:
    @staticmethod
    def create_reseller(db: Session, reseller_data: schemas.ResellerCreate) -> Reseller:
        """Create a new reseller record"""
        db_reseller = Reseller(
            reseller_name=reseller_data.ResellerName,
            contact_person=reseller_data.ContactPerson,
            contact_email=reseller_data.ContactEmail,
            contact_phone=reseller_data.ContactPhone,
            address=reseller_data.Address,
            partner_level=reseller_data.PartnerLevel,
            region=reseller_data.Region,
            status=reseller_data.Status
        )
        
        db.add(db_reseller)
        db.commit()
        db.refresh(db_reseller)
        
        return db_reseller

    @staticmethod
    def get_reseller(db: Session, reseller_id: int) -> Optional[schemas.ResellerInfo]:
        """Get information about a specific reseller"""
        reseller = db.query(Reseller).filter(Reseller.reseller_id == reseller_id).first()
        
        if not reseller:
            return None
            
        return schemas.ResellerInfo(
            ResellerID=reseller.reseller_id,
            ResellerName=reseller.reseller_name,
            ContactPerson=reseller.contact_person,
            ContactEmail=reseller.contact_email,
            ContactPhone=reseller.contact_phone,
            Address=reseller.address,
            PartnerLevel=reseller.partner_level,
            Region=reseller.region,
            Status=reseller.status,
            CreatedAt=reseller.created_at,
            UpdatedAt=reseller.updated_at
        )

    @staticmethod
    def get_resellers(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        name_filter: Optional[str] = None,
        partner_level: Optional[str] = None,
        region: Optional[str] = None,
        status: Optional[schemas.StatusEnum] = None
    ) -> List[schemas.ResellerInfo]:
        """Get list of resellers with filtering options"""
        query = db.query(Reseller)
        
        # Apply filters
        if name_filter:
            query = query.filter(Reseller.reseller_name.ilike(f"%{name_filter}%"))
        if partner_level:
            query = query.filter(Reseller.partner_level == partner_level)
        if region:
            query = query.filter(Reseller.region == region)
        if status:
            query = query.filter(Reseller.status == status)
        
        # Apply pagination
        resellers = query.order_by(Reseller.reseller_name).offset(skip).limit(limit).all()
        
        # Convert to schema model
        return [
            schemas.ResellerInfo(
                ResellerID=reseller.reseller_id,
                ResellerName=reseller.reseller_name,
                ContactPerson=reseller.contact_person,
                ContactEmail=reseller.contact_email,
                ContactPhone=reseller.contact_phone,
                Address=reseller.address,
                PartnerLevel=reseller.partner_level,
                Region=reseller.region,
                Status=reseller.status,
                CreatedAt=reseller.created_at,
                UpdatedAt=reseller.updated_at
            )
            for reseller in resellers
        ]

    @staticmethod
    def update_reseller(
        db: Session, 
        reseller_id: int, 
        reseller_data: schemas.ResellerUpdate
    ) -> Optional[schemas.ResellerInfo]:
        """Update reseller information"""
        reseller = db.query(Reseller).filter(Reseller.reseller_id == reseller_id).first()
        
        if not reseller:
            return None
        
        # Update fields if provided
        update_data = reseller_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                # Convert CamelCase to snake_case for database column names
                db_key = ''.join(['_' + c.lower() if c.isupper() else c for c in key]).lstrip('_')
                setattr(reseller, db_key, value)
        
        # Update the last modified date
        reseller.updated_at = datetime.now()
        
        db.commit()
        db.refresh(reseller)
        
        # Return the updated reseller
        return schemas.ResellerInfo(
            ResellerID=reseller.reseller_id,
            ResellerName=reseller.reseller_name,
            ContactPerson=reseller.contact_person,
            ContactEmail=reseller.contact_email,
            ContactPhone=reseller.contact_phone,
            Address=reseller.address,
            PartnerLevel=reseller.partner_level,
            Region=reseller.region,
            Status=reseller.status,
            CreatedAt=reseller.created_at,
            UpdatedAt=reseller.updated_at
        )

    @staticmethod
    def delete_reseller(db: Session, reseller_id: int) -> bool:
        """Delete a reseller"""
        reseller = db.query(Reseller).filter(Reseller.reseller_id == reseller_id).first()
        
        if not reseller:
            return False
        
        db.delete(reseller)
        db.commit()
        
        return True
    
    @staticmethod
    def get_reseller_licenses(db: Session, reseller_id: int, skip: int = 0, limit: int = 100) -> List[schemas.LicenseInfo]:
        """Get all licenses associated with a specific reseller"""
        licenses = db.query(License)\
            .filter(License.reseller_id == reseller_id)\
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
    def get_reseller_performance(db: Session, reseller_id: Optional[int] = None) -> Dict[str, Any]:
        """Get sales performance metrics for a reseller or all resellers"""
        from sqlalchemy import and_, extract, func
        from datetime import datetime, timedelta
        
        today = datetime.now().date()
        year_start = datetime(today.year, 1, 1).date()
        
        # Base query for reseller data
        query = db.query(
                Reseller.reseller_id,
                Reseller.reseller_name,
                func.count(License.license_id).label("total_licenses"),
                func.sum(PurchaseRecord.amount).label("total_revenue")
            )\
            .join(License, License.reseller_id == Reseller.reseller_id)\
            .join(PurchaseRecord, PurchaseRecord.license_id == License.license_id)\
            .filter(PurchaseRecord.purchase_date >= year_start)\
            .group_by(Reseller.reseller_id, Reseller.reseller_name)
        
        # If reseller_id is provided, filter by that reseller
        if reseller_id:
            query = query.filter(Reseller.reseller_id == reseller_id)
        
        # Execute the query
        results = query.all()
        
        # Format the results
        if reseller_id:
            # Single reseller performance
            if not results:
                return {
                    "total_licenses": 0,
                    "total_revenue": 0,
                    "monthly_performance": []
                }
                
            result = results[0]
            
            # Get monthly performance
            monthly_query = db.query(
                    func.extract('month', PurchaseRecord.purchase_date).label("month"),
                    func.count(License.license_id).label("licenses"),
                    func.sum(PurchaseRecord.amount).label("revenue")
                )\
                .join(License, License.license_id == PurchaseRecord.license_id)\
                .filter(
                    License.reseller_id == reseller_id,
                    PurchaseRecord.purchase_date >= year_start
                )\
                .group_by(func.extract('month', PurchaseRecord.purchase_date))\
                .order_by(func.extract('month', PurchaseRecord.purchase_date))
            
            monthly_data = monthly_query.all()
            
            return {
                "reseller_id": result.reseller_id,
                "reseller_name": result.reseller_name,
                "total_licenses": result.total_licenses or 0,
                "total_revenue": float(result.total_revenue or 0),
                "monthly_performance": [
                    {
                        "month": int(month),
                        "licenses": licenses,
                        "revenue": float(revenue) if revenue else 0
                    }
                    for month, licenses, revenue in monthly_data
                ]
            }
        else:
            # All resellers performance
            return {
                "resellers": [
                    {
                        "reseller_id": result.reseller_id,
                        "reseller_name": result.reseller_name,
                        "total_licenses": result.total_licenses or 0,
                        "total_revenue": float(result.total_revenue or 0)
                    }
                    for result in results
                ],
                "total_licenses": sum(result.total_licenses or 0 for result in results),
                "total_revenue": sum(float(result.total_revenue or 0) for result in results)
            }
