from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta

from app.models.models import PurchaseRecord, License, Customer, SalesRep, Reseller
from app.schemas import schemas


class PurchaseService:
    @staticmethod
    def create_purchase_record(db: Session, purchase_data: schemas.PurchaseRecordCreate) -> PurchaseRecord:
        """Create a new purchase record"""
        # Verify the license exists
        license = db.query(License).filter(License.license_id == purchase_data.LicenseID).first()
        if not license:
            raise ValueError(f"License with ID {purchase_data.LicenseID} not found")
        
        # Create the purchase record
        db_purchase = PurchaseRecord(
            license_id=purchase_data.LicenseID,
            purchase_type=purchase_data.PurchaseType,
            purchase_date=purchase_data.PurchaseDate,
            order_number=purchase_data.OrderNumber,
            contract_number=purchase_data.ContractNumber,
            amount=purchase_data.Amount,
            currency=purchase_data.Currency,
            payment_status=purchase_data.PaymentStatus,
            payment_date=purchase_data.PaymentDate,
            workspaces_purchased=purchase_data.WorkspacesPurchased,
            users_purchased=purchase_data.UsersPurchased,
            previous_expiry_date=purchase_data.PreviousExpiryDate,
            new_expiry_date=purchase_data.NewExpiryDate,
            notes=purchase_data.Notes
        )
        
        db.add(db_purchase)
        db.commit()
        db.refresh(db_purchase)
        
        # Update the license if this is a renewal or expansion
        if purchase_data.PurchaseType in [schemas.PurchaseTypeEnum.RENEWAL, schemas.PurchaseTypeEnum.EXPANSION]:
            # Update expiry date if provided
            if purchase_data.NewExpiryDate:
                license.expiry_date = purchase_data.NewExpiryDate
                license.license_status = "ACTIVE"
            
            # Update authorized capacity if this is an expansion
            if purchase_data.PurchaseType == schemas.PurchaseTypeEnum.EXPANSION:
                if purchase_data.WorkspacesPurchased > 0:
                    license.authorized_workspaces += purchase_data.WorkspacesPurchased
                if purchase_data.UsersPurchased > 0:
                    license.authorized_users += purchase_data.UsersPurchased
            
            license.updated_at = datetime.now()
            db.commit()
        
        return db_purchase

    @staticmethod
    def get_purchase_record(db: Session, purchase_id: int) -> Optional[schemas.PurchaseRecordInfo]:
        """Get detailed information about a specific purchase record"""
        purchase = db.query(PurchaseRecord).filter(PurchaseRecord.purchase_id == purchase_id).first()
        
        if not purchase:
            return None
            
        return schemas.PurchaseRecordInfo(
            PurchaseID=purchase.purchase_id,
            LicenseID=purchase.license_id,
            PurchaseType=purchase.purchase_type,
            PurchaseDate=purchase.purchase_date,
            OrderNumber=purchase.order_number,
            ContractNumber=purchase.contract_number,
            Amount=purchase.amount,
            Currency=purchase.currency,
            PaymentStatus=purchase.payment_status,
            PaymentDate=purchase.payment_date,
            WorkspacesPurchased=purchase.workspaces_purchased,
            UsersPurchased=purchase.users_purchased,
            PreviousExpiryDate=purchase.previous_expiry_date,
            NewExpiryDate=purchase.new_expiry_date,
            Notes=purchase.notes,
            CreatedAt=purchase.created_at,
            UpdatedAt=purchase.updated_at
        )

    @staticmethod
    def get_purchase_records(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        license_id: Optional[str] = None,
        purchase_type: Optional[schemas.PurchaseTypeEnum] = None,
        payment_status: Optional[schemas.PaymentStatusEnum] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[schemas.PurchaseRecordInfo]:
        """Get list of purchase records with filtering options"""
        query = db.query(PurchaseRecord)
        
        # Apply filters
        if license_id:
            query = query.filter(PurchaseRecord.license_id == license_id)
        if purchase_type:
            query = query.filter(PurchaseRecord.purchase_type == purchase_type)
        if payment_status:
            query = query.filter(PurchaseRecord.payment_status == payment_status)
        if start_date:
            query = query.filter(PurchaseRecord.purchase_date >= start_date)
        if end_date:
            query = query.filter(PurchaseRecord.purchase_date <= end_date)
        
        # Apply pagination
        purchases = query.order_by(PurchaseRecord.purchase_date.desc()).offset(skip).limit(limit).all()
        
        # Convert to schema model
        return [
            schemas.PurchaseRecordInfo(
                PurchaseID=purchase.purchase_id,
                LicenseID=purchase.license_id,
                PurchaseType=purchase.purchase_type,
                PurchaseDate=purchase.purchase_date,
                OrderNumber=purchase.order_number,
                ContractNumber=purchase.contract_number,
                Amount=purchase.amount,
                Currency=purchase.currency,
                PaymentStatus=purchase.payment_status,
                PaymentDate=purchase.payment_date,
                WorkspacesPurchased=purchase.workspaces_purchased,
                UsersPurchased=purchase.users_purchased,
                PreviousExpiryDate=purchase.previous_expiry_date,
                NewExpiryDate=purchase.new_expiry_date,
                Notes=purchase.notes,
                CreatedAt=purchase.created_at,
                UpdatedAt=purchase.updated_at
            )
            for purchase in purchases
        ]

    @staticmethod
    def update_purchase_record(
        db: Session, 
        purchase_id: int, 
        purchase_data: schemas.PurchaseRecordUpdate
    ) -> Optional[schemas.PurchaseRecordInfo]:
        """Update purchase record information"""
        purchase = db.query(PurchaseRecord).filter(PurchaseRecord.purchase_id == purchase_id).first()
        
        if not purchase:
            return None
        
        # Store old values for potential license updates
        old_workspaces = purchase.workspaces_purchased
        old_users = purchase.users_purchased
        old_expiry_date = purchase.new_expiry_date
        
        # Update fields if provided
        update_data = purchase_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                # Convert CamelCase to snake_case for database column names
                db_key = ''.join(['_' + c.lower() if c.isupper() else c for c in key]).lstrip('_')
                setattr(purchase, db_key, value)
        
        # Update the last modified date
        purchase.updated_at = datetime.now()
        
        db.commit()
        db.refresh(purchase)
        
        # If this is a renewal or expansion, update the license accordingly
        if purchase.purchase_type in ["RENEWAL", "EXPANSION"]:
            license = db.query(License).filter(License.license_id == purchase.license_id).first()
            if license:
                # Update expiry date if it changed
                if purchase_data.NewExpiryDate and purchase_data.NewExpiryDate != old_expiry_date:
                    license.expiry_date = purchase_data.NewExpiryDate
                    license.license_status = "ACTIVE"
                
                # Update authorized capacity if this is an expansion and values changed
                if purchase.purchase_type == "EXPANSION":
                    if purchase_data.WorkspacesPurchased is not None and purchase_data.WorkspacesPurchased != old_workspaces:
                        # Adjust the license's authorized workspaces
                        license.authorized_workspaces = license.authorized_workspaces - old_workspaces + purchase_data.WorkspacesPurchased
                    
                    if purchase_data.UsersPurchased is not None and purchase_data.UsersPurchased != old_users:
                        # Adjust the license's authorized users
                        license.authorized_users = license.authorized_users - old_users + purchase_data.UsersPurchased
                
                license.updated_at = datetime.now()
                db.commit()
        
        # Return the updated purchase record
        return schemas.PurchaseRecordInfo(
            PurchaseID=purchase.purchase_id,
            LicenseID=purchase.license_id,
            PurchaseType=purchase.purchase_type,
            PurchaseDate=purchase.purchase_date,
            OrderNumber=purchase.order_number,
            ContractNumber=purchase.contract_number,
            Amount=purchase.amount,
            Currency=purchase.currency,
            PaymentStatus=purchase.payment_status,
            PaymentDate=purchase.payment_date,
            WorkspacesPurchased=purchase.workspaces_purchased,
            UsersPurchased=purchase.users_purchased,
            PreviousExpiryDate=purchase.previous_expiry_date,
            NewExpiryDate=purchase.new_expiry_date,
            Notes=purchase.notes,
            CreatedAt=purchase.created_at,
            UpdatedAt=purchase.updated_at
        )

    @staticmethod
    def delete_purchase_record(db: Session, purchase_id: int) -> bool:
        """Delete a purchase record"""
        purchase = db.query(PurchaseRecord).filter(PurchaseRecord.purchase_id == purchase_id).first()
        
        if not purchase:
            return False
        
        # For renewals or expansions, we might need to update the license
        if purchase.purchase_type in ["RENEWAL", "EXPANSION"]:
            license = db.query(License).filter(License.license_id == purchase.license_id).first()
            if license:
                # If this was an expansion, reduce the authorized capacity
                if purchase.purchase_type == "EXPANSION":
                    if purchase.workspaces_purchased > 0:
                        license.authorized_workspaces -= purchase.workspaces_purchased
                    if purchase.users_purchased > 0:
                        license.authorized_users -= purchase.users_purchased
                
                # If this was a renewal and it extended the expiry date, we need to revert
                # However, determining the correct expiry date may be complex
                # For now, we'll just mark that the license needs review
                if purchase.purchase_type == "RENEWAL" and purchase.new_expiry_date:
                    # If previous_expiry_date exists, revert to it
                    if purchase.previous_expiry_date:
                        license.expiry_date = purchase.previous_expiry_date
                    # Add a note about deletion
                    license.notes = (license.notes or "") + f"\nRenewal purchase record {purchase_id} was deleted on {datetime.now()}, license may need review."
                
                license.updated_at = datetime.now()
                db.commit()
        
        db.delete(purchase)
        db.commit()
        
        return True
    
    @staticmethod
    def get_revenue_statistics(db: Session, year: Optional[int] = None) -> Dict[str, Any]:
        """Get revenue statistics for a specific year or all time"""
        current_year = datetime.now().year
        target_year = year or current_year
        
        # Start/end dates for target year
        start_date = date(target_year, 1, 1)
        end_date = date(target_year, 12, 31)
        
        # Total revenue for all time
        total_revenue = db.query(func.sum(PurchaseRecord.amount)).scalar() or 0
        
        # Revenue for the target year
        annual_revenue = db.query(func.sum(PurchaseRecord.amount))\
            .filter(
                PurchaseRecord.purchase_date >= start_date,
                PurchaseRecord.purchase_date <= end_date
            ).scalar() or 0
        
        # Monthly revenue for the target year
        monthly_revenue_query = db.query(
                func.extract('month', PurchaseRecord.purchase_date).label("month"),
                func.sum(PurchaseRecord.amount).label("revenue")
            )\
            .filter(
                PurchaseRecord.purchase_date >= start_date,
                PurchaseRecord.purchase_date <= end_date
            )\
            .group_by(func.extract('month', PurchaseRecord.purchase_date))\
            .order_by(func.extract('month', PurchaseRecord.purchase_date))
        
        monthly_revenue_data = monthly_revenue_query.all()
        
        # Convert to dictionary with all months
        monthly_revenue = {i: 0.0 for i in range(1, 13)}
        for month, revenue in monthly_revenue_data:
            monthly_revenue[int(month)] = float(revenue)
        
        # Revenue by purchase type
        revenue_by_type_query = db.query(
                PurchaseRecord.purchase_type,
                func.sum(PurchaseRecord.amount).label("revenue")
            )\
            .filter(
                PurchaseRecord.purchase_date >= start_date,
                PurchaseRecord.purchase_date <= end_date
            )\
            .group_by(PurchaseRecord.purchase_type)
        
        revenue_by_type_data = revenue_by_type_query.all()
        revenue_by_type = {purchase_type: float(revenue) for purchase_type, revenue in revenue_by_type_data}
        
        # Revenue by customer
        revenue_by_customer_query = db.query(
                Customer.customer_id,
                Customer.customer_name,
                func.sum(PurchaseRecord.amount).label("revenue")
            )\
            .join(License, License.license_id == PurchaseRecord.license_id)\
            .join(Customer, Customer.customer_id == License.customer_id)\
            .filter(
                PurchaseRecord.purchase_date >= start_date,
                PurchaseRecord.purchase_date <= end_date
            )\
            .group_by(Customer.customer_id, Customer.customer_name)\
            .order_by(func.sum(PurchaseRecord.amount).desc())\
            .limit(10)
        
        top_customers = [
            {
                "customer_id": customer_id,
                "customer_name": customer_name,
                "revenue": float(revenue)
            }
            for customer_id, customer_name, revenue in revenue_by_customer_query.all()
        ]
        
        return {
            "year": target_year,
            "total_revenue_all_time": float(total_revenue),
            "annual_revenue": float(annual_revenue),
            "monthly_revenue": monthly_revenue,
            "revenue_by_purchase_type": revenue_by_type,
            "top_customers_by_revenue": top_customers
        }
