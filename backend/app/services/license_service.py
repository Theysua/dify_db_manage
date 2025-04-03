from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date, timedelta
import uuid
import json

from app.models.models import License, Customer, SalesRep, Reseller, PurchaseRecord, DeploymentRecord, DeploymentEngineer, FactoryEngineer, ChangeTracking
from app.schemas import schemas


class LicenseService:
    @staticmethod
    def generate_license_id(license_type: str) -> str:
        """Generate a unique license ID based on type and current date"""
        today = datetime.now().strftime("%Y%m%d")
        random_str = uuid.uuid4().hex[:6].upper()
        return f"{license_type}-{today}-{random_str}"

    @staticmethod
    def create_license(db: Session, license_data: schemas.LicenseCreate) -> License:
        """Create a new license record"""
        # Generate a unique license ID based on license type
        license_id = LicenseService.generate_license_id(license_data.LicenseType)
        
        # Create the license record with lowercase attribute names
        db_license = License(
            license_id=license_id,
            customer_id=license_data.CustomerID,
            sales_rep_id=license_data.SalesRepID,
            reseller_id=license_data.ResellerID,
            product_name=license_data.ProductName,
            product_version=license_data.ProductVersion,
            license_type=license_data.LicenseType,
            order_date=datetime.now().date(),
            start_date=license_data.StartDate,
            expiry_date=license_data.ExpiryDate,
            authorized_workspaces=license_data.AuthorizedWorkspaces,
            authorized_users=license_data.AuthorizedUsers,
            actual_workspaces=0,
            actual_users=0,
            license_status="PENDING",
            notes=license_data.Notes
        )
        
        db.add(db_license)
        db.commit()
        db.refresh(db_license)
        
        # Track the change
        change = ChangeTracking(
            table_name="licenses",
            record_id=license_id,
            field_name="creation",
            new_value=json.dumps({
                "license_id": license_id,
                "customer_id": license_data.CustomerID,
                "license_type": license_data.LicenseType,
                "created_at": datetime.now().isoformat()
            }),
            changed_by="system",
            change_reason="License creation"
        )
        db.add(change)
        db.commit()
        
        return db_license

    @staticmethod
    def get_license(db: Session, license_id: str) -> Optional[schemas.LicenseDetailedInfo]:
        """Get detailed information about a specific license"""
        # Get the license with all related entities
        license = db.query(License)\
            .options(
                joinedload(License.customer),
                joinedload(License.sales_rep),
                joinedload(License.reseller),
                joinedload(License.purchase_records),
                joinedload(License.deployment_records).joinedload(DeploymentRecord.engineer_assignments).joinedload(DeploymentEngineer.engineer)
            )\
            .filter(License.license_id == license_id)\
            .first()
            
        if not license:
            return None
            
        # Convert to schema model with proper PascalCase properties
        return LicenseService._license_to_schema(db, license)

    @staticmethod
    def _license_to_schema(db: Session, license: License) -> schemas.LicenseDetailedInfo:
        """Convert ORM model to Pydantic schema with proper case conversion"""
        
        # Convert deployment records
        deployment_records_info = []
        for record in license.deployment_records:
            # Convert engineer assignments
            engineer_assignments = []
            for assignment in record.engineer_assignments:
                engineer = assignment.engineer
                engineer_assignments.append(schemas.EngineerAssignmentInfo(
                    EngineerID=engineer.engineer_id,
                    EngineerName=engineer.engineer_name,
                    Email=engineer.email,
                    Role=assignment.role
                ))
            
            deployment_records_info.append(schemas.DeploymentRecordInfo(
                DeploymentID=record.deployment_id,
                LicenseID=record.license_id,
                DeploymentType=record.deployment_type,
                DeploymentDate=record.deployment_date,
                DeployedBy=record.deployed_by,
                DeploymentStatus=record.deployment_status,
                DeploymentEnvironment=record.deployment_environment,
                ServerInfo=record.server_info,
                CompletionDate=record.completion_date,
                Notes=record.notes,
                CreatedAt=record.created_at,
                UpdatedAt=record.updated_at,
                EngineerAssignments=engineer_assignments
            ))
        
        # Convert purchase records
        purchase_records_info = []
        for record in license.purchase_records:
            purchase_records_info.append(schemas.PurchaseRecordInfo(
                PurchaseID=record.purchase_id,
                LicenseID=record.license_id,
                PurchaseType=record.purchase_type,
                PurchaseDate=record.purchase_date,
                OrderNumber=record.order_number,
                ContractNumber=record.contract_number,
                Amount=record.amount,
                Currency=record.currency,
                PaymentStatus=record.payment_status,
                PaymentDate=record.payment_date,
                WorkspacesPurchased=record.workspaces_purchased,
                UsersPurchased=record.users_purchased,
                PreviousExpiryDate=record.previous_expiry_date,
                NewExpiryDate=record.new_expiry_date,
                Notes=record.notes,
                CreatedAt=record.created_at,
                UpdatedAt=record.updated_at
            ))
        
        # Create the detailed license info
        license_info = schemas.LicenseDetailedInfo(
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
            UpdatedAt=license.updated_at,
            
            # Related entities
            Customer=schemas.CustomerInfo(
                CustomerID=license.customer.customer_id,
                CustomerName=license.customer.customer_name,
                ContactPerson=license.customer.contact_person,
                ContactEmail=license.customer.contact_email,
                ContactPhone=license.customer.contact_phone,
                Address=license.customer.address,
                Industry=license.customer.industry,
                CustomerType=license.customer.customer_type,
                Region=license.customer.region,
                Notes=license.customer.notes,
                CreatedAt=license.customer.created_at,
                UpdatedAt=license.customer.updated_at
            ),
            PurchaseRecords=purchase_records_info,
            DeploymentRecords=deployment_records_info
        )
        
        # Add sales rep if available
        if license.sales_rep:
            license_info.SalesRep = schemas.SalesRepInfo(
                SalesRepID=license.sales_rep.sales_rep_id,
                SalesRepName=license.sales_rep.sales_rep_name,
                Email=license.sales_rep.email,
                Phone=license.sales_rep.phone,
                Department=license.sales_rep.salesperson_type,
                Position=license.sales_rep.position,
                Status=license.sales_rep.status,
                CreatedAt=license.sales_rep.created_at,
                UpdatedAt=license.sales_rep.updated_at
            )
        
        # Add reseller if available
        if license.reseller:
            license_info.Reseller = schemas.ResellerInfo(
                ResellerID=license.reseller.reseller_id,
                ResellerName=license.reseller.reseller_name,
                ContactPerson=license.reseller.contact_person,
                ContactEmail=license.reseller.contact_email,
                ContactPhone=license.reseller.contact_phone,
                Address=license.reseller.address,
                PartnerLevel=license.reseller.partner_level,
                Region=license.reseller.region,
                Status=license.reseller.status,
                CreatedAt=license.reseller.created_at,
                UpdatedAt=license.reseller.updated_at
            )
        
        return license_info

    @staticmethod
    def get_licenses(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        customer_id: Optional[int] = None,
        status: Optional[schemas.LicenseStatusEnum] = None,
        deployment_type: Optional[str] = None,
        license_type: Optional[str] = None,
        expiring_before: Optional[date] = None,
        expiring_after: Optional[date] = None
    ) -> List[schemas.LicenseInfo]:
        """Get list of licenses with filtering options"""
        query = db.query(License)\
            .join(Customer)\
            .outerjoin(SalesRep)\
            .outerjoin(Reseller)
        
        # Apply filters
        if customer_id:
            query = query.filter(License.customer_id == customer_id)
        if status:
            query = query.filter(License.license_status == status.value)
        if deployment_type:
            query = query.filter(License.deployment_type == deployment_type)
        if license_type:
            query = query.filter(License.license_type == license_type)
        if expiring_before:
            query = query.filter(License.expiry_date <= expiring_before)
        if expiring_after:
            query = query.filter(License.expiry_date >= expiring_after)
        
        # Apply pagination
        licenses = query.order_by(License.created_at.desc()).offset(skip).limit(limit).all()
        
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
    def update_license(
        db: Session, 
        license_id: str, 
        license_data: schemas.LicenseUpdate,
        changed_by: str = "system"
    ) -> Optional[schemas.LicenseInfo]:
        """Update license information"""
        license = db.query(License).filter(License.license_id == license_id).first()
        
        if not license:
            return None
        
        # Store changes for tracking
        changes = {}
        
        # Update fields if provided
        update_data = license_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                # Convert CamelCase to snake_case for database column names
                db_key = ''.join(['_' + c.lower() if c.isupper() else c for c in key]).lstrip('_')
                old_value = getattr(license, db_key)
                
                # Only update if the value is different
                if old_value != value:
                    setattr(license, db_key, value)
                    changes[db_key] = {"old": old_value, "new": value}
        
        # Only commit if there were changes
        if changes:
            # Update the license status based on expiry date
            today = datetime.now().date()
            if license.expiry_date < today and license.license_status != 'EXPIRED':
                license.license_status = 'EXPIRED'
                changes['license_status'] = {"old": license.license_status, "new": 'EXPIRED'}
            elif license.expiry_date >= today and license.license_status == 'EXPIRED':
                license.license_status = 'ACTIVE'
                changes['license_status'] = {"old": 'EXPIRED', "new": 'ACTIVE'}
            
            # Update the last modified date
            license.updated_at = datetime.now()
            
            db.commit()
            db.refresh(license)
            
            # Record changes
            for field, change in changes.items():
                change_record = ChangeTracking(
                    table_name="licenses",
                    record_id=license_id,
                    field_name=field,
                    old_value=str(change["old"]),
                    new_value=str(change["new"]),
                    changed_by=changed_by,
                    change_reason=f"License update: {field}"
                )
                db.add(change_record)
            
            db.commit()
        
        # Return the updated license
        return schemas.LicenseInfo(
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

    @staticmethod
    def delete_license(db: Session, license_id: str, changed_by: str = "system") -> bool:
        """Delete a license and record the change"""
        license = db.query(License).filter(License.license_id == license_id).first()
        
        if not license:
            return False
        
        # Record deletion
        change_record = ChangeTracking(
            table_name="licenses",
            record_id=license_id,
            field_name="deletion",
            old_value=json.dumps({
                "license_id": license_id,
                "customer_id": license.customer_id,
                "license_type": license.license_type,
                "created_at": license.created_at.isoformat() if license.created_at else None
            }),
            changed_by=changed_by,
            change_reason="License deletion"
        )
        db.add(change_record)
        
        # Delete the license (cascades to related records)
        db.delete(license)
        db.commit()
        
        return True
    
    @staticmethod
    def renew_license(
        db: Session,
        license_id: str,
        renewal_data: schemas.PurchaseRecordCreate,
        changed_by: str = "system"
    ) -> Optional[schemas.LicenseInfo]:
        """Renew a license and create a purchase record"""
        license = db.query(License).filter(License.license_id == license_id).first()
        
        if not license:
            return None
        
        # Store original expiry date
        previous_expiry_date = license.expiry_date
        
        # Create purchase record for renewal
        purchase_record = PurchaseRecord(
            license_id=license_id,
            purchase_type="RENEWAL",
            purchase_date=renewal_data.PurchaseDate,
            order_number=renewal_data.OrderNumber,
            contract_number=renewal_data.ContractNumber,
            amount=renewal_data.Amount,
            currency=renewal_data.Currency,
            payment_status=renewal_data.PaymentStatus,
            payment_date=renewal_data.PaymentDate,
            workspaces_purchased=renewal_data.WorkspacesPurchased,
            users_purchased=renewal_data.UsersPurchased,
            previous_expiry_date=previous_expiry_date,
            new_expiry_date=renewal_data.NewExpiryDate,
            notes=renewal_data.Notes
        )
        
        db.add(purchase_record)
        
        # Update license with new expiry date and status
        license.expiry_date = renewal_data.NewExpiryDate
        license.license_status = "ACTIVE"
        
        # Update authorized workspaces/users if specified
        if renewal_data.WorkspacesPurchased > 0:
            license.authorized_workspaces = renewal_data.WorkspacesPurchased
        
        if renewal_data.UsersPurchased > 0:
            license.authorized_users = renewal_data.UsersPurchased
        
        license.updated_at = datetime.now()
        
        db.commit()
        db.refresh(license)
        db.refresh(purchase_record)
        
        # Record the changes
        changes = {
            "expiry_date": {"old": previous_expiry_date, "new": license.expiry_date},
            "license_status": {"old": "EXPIRED" if previous_expiry_date < datetime.now().date() else license.license_status, "new": "ACTIVE"}
        }
        
        if renewal_data.WorkspacesPurchased > 0:
            changes["authorized_workspaces"] = {"old": license.authorized_workspaces - renewal_data.WorkspacesPurchased, "new": license.authorized_workspaces}
        
        if renewal_data.UsersPurchased > 0:
            changes["authorized_users"] = {"old": license.authorized_users - renewal_data.UsersPurchased, "new": license.authorized_users}
        
        # Record changes
        for field, change in changes.items():
            change_record = ChangeTracking(
                table_name="licenses",
                record_id=license_id,
                field_name=field,
                old_value=str(change["old"]),
                new_value=str(change["new"]),
                changed_by=changed_by,
                change_reason=f"License renewal: {field}"
            )
            db.add(change_record)
        
        db.commit()
        
        # Return the updated license
        return schemas.LicenseInfo(
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
    
    @staticmethod
    def update_usage(
        db: Session,
        license_id: str,
        actual_workspaces: Optional[int] = None,
        actual_users: Optional[int] = None,
        changed_by: str = "system"
    ) -> Optional[schemas.LicenseInfo]:
        """Update the actual usage of a license"""
        license = db.query(License).filter(License.license_id == license_id).first()
        
        if not license:
            return None
        
        # Store changes for tracking
        changes = {}
        
        # Update actual workspaces if provided
        if actual_workspaces is not None and license.actual_workspaces != actual_workspaces:
            old_workspaces = license.actual_workspaces
            license.actual_workspaces = actual_workspaces
            changes["actual_workspaces"] = {"old": old_workspaces, "new": actual_workspaces}
        
        # Update actual users if provided
        if actual_users is not None and license.actual_users != actual_users:
            old_users = license.actual_users
            license.actual_users = actual_users
            changes["actual_users"] = {"old": old_users, "new": actual_users}
        
        # Update last check date
        license.last_check_date = datetime.now().date()
        
        # Only commit if there were changes
        if changes:
            license.updated_at = datetime.now()
            db.commit()
            db.refresh(license)
            
            # Record changes
            for field, change in changes.items():
                change_record = ChangeTracking(
                    table_name="licenses",
                    record_id=license_id,
                    field_name=field,
                    old_value=str(change["old"]),
                    new_value=str(change["new"]),
                    changed_by=changed_by,
                    change_reason=f"License usage update: {field}"
                )
                db.add(change_record)
            
            db.commit()
        
        # Return the updated license
        return schemas.LicenseInfo(
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

    @staticmethod
    def get_licenses_by_expiry(db: Session, days: int = 30, limit: int = 10) -> List[schemas.LicenseInfo]:
        """Get licenses that will expire within the specified number of days"""
        today = datetime.now().date()
        expiry_date = today + timedelta(days=days)
        
        # Get licenses that expire within the specified period and are active
        licenses = db.query(License)\
            .filter(
                License.expiry_date <= expiry_date,
                License.expiry_date >= today,
                License.license_status == "ACTIVE"
            )\
            .order_by(License.expiry_date.asc())\
            .limit(limit)\
            .all()
        
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
    def get_licenses_statistics(db: Session) -> schemas.LicenseStatistics:
        """Get statistics for licenses"""
        today = datetime.now().date()
        month_start = date(today.year, today.month, 1)
        month_end = date(today.year if today.month < 12 else today.year + 1,
                        today.month + 1 if today.month < 12 else 1, 1) - timedelta(days=1)
        next_month_end = date(today.year if today.month < 11 else today.year + 1,
                            today.month + 2 if today.month < 11 else (today.month - 10),
                            1) - timedelta(days=1)
        
        # Total licenses
        total_licenses = db.query(func.count(License.license_id)).scalar()
        
        # Active licenses
        active_licenses = db.query(func.count(License.license_id))\
            .filter(License.license_status == "ACTIVE")\
            .scalar()
        
        # Expired licenses
        expired_licenses = db.query(func.count(License.license_id))\
            .filter(License.license_status == "EXPIRED")\
            .scalar()
        
        # Licenses expiring next month
        expiring_next_month = db.query(func.count(License.license_id))\
            .filter(
                License.expiry_date <= next_month_end,
                License.expiry_date > month_end,
                License.license_status == "ACTIVE"
            )\
            .scalar()
        
        # New licenses this month
        new_licenses_this_month = db.query(func.count(License.license_id))\
            .filter(
                License.order_date >= month_start,
                License.order_date <= month_end
            )\
            .scalar()
        
        # Licenses by type
        license_types = db.query(
                License.license_type,
                func.count(License.license_id).label("count")
            )\
            .group_by(License.license_type)\
            .all()
        
        licenses_by_type = {license_type: count for license_type, count in license_types}
        
        # Licenses by status
        license_statuses = db.query(
                License.license_status,
                func.count(License.license_id).label("count")
            )\
            .group_by(License.license_status)\
            .all()
        
        licenses_by_status = {status: count for status, count in license_statuses}
        
        return schemas.LicenseStatistics(
            TotalLicenses=total_licenses,
            ActiveLicenses=active_licenses,
            ExpiredLicenses=expired_licenses,
            ExpiringNextMonth=expiring_next_month,
            NewLicensesThisMonth=new_licenses_this_month,
            LicensesByType=licenses_by_type,
            LicensesByStatus=licenses_by_status
        )
