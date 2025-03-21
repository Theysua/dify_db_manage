from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.models import SalesRep, License
from app.schemas import schemas


class SalesRepService:
    @staticmethod
    def create_sales_rep(db: Session, sales_rep_data: schemas.SalesRepCreate) -> schemas.SalesRepInfo:
        """Create a new sales rep record"""
        db_sales_rep = SalesRep(
            sales_rep_name=sales_rep_data.SalesRepName,
            email=sales_rep_data.Email,
            phone=sales_rep_data.Phone,
            department=sales_rep_data.Department,
            position=sales_rep_data.Position,
            status=sales_rep_data.Status
        )
        
        db.add(db_sales_rep)
        db.commit()
        db.refresh(db_sales_rep)
        
        # 转换为SalesRepInfo模式返回
        return schemas.SalesRepInfo(
            SalesRepID=db_sales_rep.sales_rep_id,
            SalesRepName=db_sales_rep.sales_rep_name,
            Email=db_sales_rep.email,
            Phone=db_sales_rep.phone,
            Department=db_sales_rep.department,
            Position=db_sales_rep.position,
            Status=db_sales_rep.status,
            CreatedAt=db_sales_rep.created_at,
            UpdatedAt=db_sales_rep.updated_at
        )

    @staticmethod
    def get_sales_rep(db: Session, sales_rep_id: int) -> Optional[schemas.SalesRepInfo]:
        """Get information about a specific sales rep"""
        sales_rep = db.query(SalesRep).filter(SalesRep.sales_rep_id == sales_rep_id).first()
        
        if not sales_rep:
            return None
            
        return schemas.SalesRepInfo(
            SalesRepID=sales_rep.sales_rep_id,
            SalesRepName=sales_rep.sales_rep_name,
            Email=sales_rep.email,
            Phone=sales_rep.phone,
            Department=sales_rep.department,
            Position=sales_rep.position,
            Status=sales_rep.status,
            CreatedAt=sales_rep.created_at,
            UpdatedAt=sales_rep.updated_at
        )

    @staticmethod
    def get_sales_reps(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        name_filter: Optional[str] = None,
        department: Optional[str] = None,
        status: Optional[schemas.StatusEnum] = None
    ) -> Dict[str, Any]:
        """Get list of sales reps with filtering options and total count"""
        query = db.query(SalesRep)
        
        # Apply filters
        if name_filter:
            query = query.filter(SalesRep.sales_rep_name.ilike(f"%{name_filter}%"))
        if department:
            query = query.filter(SalesRep.department == department)
        if status:
            query = query.filter(SalesRep.status == status)
        
        # Get total count (before pagination)
        total_count = query.count()
        
        # Apply pagination
        sales_reps = query.order_by(SalesRep.sales_rep_name).offset(skip).limit(limit).all()
        
        # Convert to schema model
        result = [
            schemas.SalesRepInfo(
                SalesRepID=sales_rep.sales_rep_id,
                SalesRepName=sales_rep.sales_rep_name,
                Email=sales_rep.email,
                Phone=sales_rep.phone,
                Department=sales_rep.department,
                Position=sales_rep.position,
                Status=sales_rep.status,
                CreatedAt=sales_rep.created_at,
                UpdatedAt=sales_rep.updated_at
            )
            for sales_rep in sales_reps
        ]
        
        return {
            "items": result,
            "total": total_count
        }

    @staticmethod
    def update_sales_rep(
        db: Session, 
        sales_rep_id: int, 
        sales_rep_data: schemas.SalesRepUpdate
    ) -> Optional[schemas.SalesRepInfo]:
        """Update sales rep information"""
        sales_rep = db.query(SalesRep).filter(SalesRep.sales_rep_id == sales_rep_id).first()
        
        if not sales_rep:
            return None
        
        # Update fields if provided
        update_data = sales_rep_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                # Convert CamelCase to snake_case for database column names
                db_key = ''.join(['_' + c.lower() if c.isupper() else c for c in key]).lstrip('_')
                setattr(sales_rep, db_key, value)
        
        # Update the last modified date
        sales_rep.updated_at = datetime.now()
        
        db.commit()
        db.refresh(sales_rep)
        
        # Return the updated sales rep
        return schemas.SalesRepInfo(
            SalesRepID=sales_rep.sales_rep_id,
            SalesRepName=sales_rep.sales_rep_name,
            Email=sales_rep.email,
            Phone=sales_rep.phone,
            Department=sales_rep.department,
            Position=sales_rep.position,
            Status=sales_rep.status,
            CreatedAt=sales_rep.created_at,
            UpdatedAt=sales_rep.updated_at
        )

    @staticmethod
    def delete_sales_rep(db: Session, sales_rep_id: int) -> bool:
        """Delete a sales rep"""
        sales_rep = db.query(SalesRep).filter(SalesRep.sales_rep_id == sales_rep_id).first()
        
        if not sales_rep:
            return False
        
        db.delete(sales_rep)
        db.commit()
        
        return True
    
    @staticmethod
    def get_sales_rep_licenses(db: Session, sales_rep_id: int, skip: int = 0, limit: int = 100) -> List[schemas.LicenseInfo]:
        """Get all licenses managed by a specific sales rep"""
        licenses = db.query(License)\
            .filter(License.sales_rep_id == sales_rep_id)\
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
    def get_sales_performance(db: Session, sales_rep_id: Optional[int] = None) -> Dict[str, Any]:
        """Get sales performance metrics for a sales rep or all sales reps"""
        from sqlalchemy import and_, extract, func
        from app.models.models import PurchaseRecord
        from datetime import datetime, timedelta
        
        today = datetime.now().date()
        year_start = datetime(today.year, 1, 1).date()
        
        # Base query for sales data
        query = db.query(
                SalesRep.sales_rep_id,
                SalesRep.sales_rep_name,
                func.count(License.license_id).label("total_licenses"),
                func.sum(PurchaseRecord.amount).label("total_revenue")
            )\
            .join(License, License.sales_rep_id == SalesRep.sales_rep_id)\
            .join(PurchaseRecord, PurchaseRecord.license_id == License.license_id)\
            .filter(PurchaseRecord.purchase_date >= year_start)\
            .group_by(SalesRep.sales_rep_id, SalesRep.sales_rep_name)
        
        # If sales_rep_id is provided, filter by that sales rep
        if sales_rep_id:
            query = query.filter(SalesRep.sales_rep_id == sales_rep_id)
        
        # Execute the query
        results = query.all()
        
        # Format the results
        if sales_rep_id:
            # Single sales rep performance
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
                    License.sales_rep_id == sales_rep_id,
                    PurchaseRecord.purchase_date >= year_start
                )\
                .group_by(func.extract('month', PurchaseRecord.purchase_date))\
                .order_by(func.extract('month', PurchaseRecord.purchase_date))
            
            monthly_data = monthly_query.all()
            
            return {
                "sales_rep_id": result.sales_rep_id,
                "sales_rep_name": result.sales_rep_name,
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
            # All sales reps performance
            return {
                "sales_reps": [
                    {
                        "sales_rep_id": result.sales_rep_id,
                        "sales_rep_name": result.sales_rep_name,
                        "total_licenses": result.total_licenses or 0,
                        "total_revenue": float(result.total_revenue or 0)
                    }
                    for result in results
                ],
                "total_licenses": sum(result.total_licenses or 0 for result in results),
                "total_revenue": sum(float(result.total_revenue or 0) for result in results)
            }
