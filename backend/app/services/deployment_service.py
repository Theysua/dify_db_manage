from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta

from app.models.models import DeploymentRecord, License, DeploymentEngineer, FactoryEngineer
from app.schemas import schemas


class DeploymentService:
    @staticmethod
    def create_deployment_record(db: Session, deployment_data: schemas.DeploymentRecordCreate) -> schemas.DeploymentRecordInfo:
        """Create a new deployment record with optional engineer assignments"""
        # Verify the license exists
        license = db.query(License).filter(License.license_id == deployment_data.LicenseID).first()
        if not license:
            raise ValueError(f"License with ID {deployment_data.LicenseID} not found")
        
        # Create the deployment record
        db_deployment = DeploymentRecord(
            license_id=deployment_data.LicenseID,
            deployment_type=deployment_data.DeploymentType,
            deployment_date=deployment_data.DeploymentDate,
            deployed_by=deployment_data.DeployedBy,
            deployment_status=deployment_data.DeploymentStatus,
            deployment_environment=deployment_data.DeploymentEnvironment,
            server_info=deployment_data.ServerInfo,
            completion_date=deployment_data.CompletionDate,
            notes=deployment_data.Notes
        )
        
        db.add(db_deployment)
        db.commit()
        db.refresh(db_deployment)
        
        # Add engineer assignments if provided
        if deployment_data.EngineerAssignments:
            for assignment in deployment_data.EngineerAssignments:
                # Verify the engineer exists
                engineer = db.query(FactoryEngineer).filter(FactoryEngineer.engineer_id == assignment.EngineerID).first()
                if not engineer:
                    raise ValueError(f"Engineer with ID {assignment.EngineerID} not found")
                
                # Create the assignment
                db_assignment = DeploymentEngineer(
                    deployment_id=db_deployment.deployment_id,
                    engineer_id=assignment.EngineerID,
                    role=assignment.Role
                )
                
                db.add(db_assignment)
            
            db.commit()
        
        # Update the license deployment status and date
        if deployment_data.DeploymentStatus == schemas.DeploymentStatusEnum.COMPLETED:
            license.deployment_status = "COMPLETED"
            license.deployment_date = deployment_data.CompletionDate or deployment_data.DeploymentDate
            license.license_status = "ACTIVE"  # Activate the license once deployment is complete
        else:
            license.deployment_status = "IN_PROGRESS"
        
        license.updated_at = datetime.now()
        db.commit()
        
        # Refresh to get the full deployment with assignments
        db_deployment = db.query(DeploymentRecord)\
            .options(joinedload(DeploymentRecord.engineer_assignments).joinedload(DeploymentEngineer.engineer))\
            .filter(DeploymentRecord.deployment_id == db_deployment.deployment_id)\
            .first()
        
        # Convert engineer assignments
        engineer_assignments = []
        for assignment in db_deployment.engineer_assignments:
            engineer = assignment.engineer
            engineer_assignments.append(schemas.EngineerAssignmentInfo(
                EngineerID=engineer.engineer_id,
                EngineerName=engineer.engineer_name,
                Email=engineer.email,
                Role=assignment.role
            ))
        
        # Convert deployment record to schema
        return schemas.DeploymentRecordInfo(
            DeploymentID=db_deployment.deployment_id,
            LicenseID=db_deployment.license_id,
            DeploymentType=db_deployment.deployment_type,
            DeploymentDate=db_deployment.deployment_date,
            DeployedBy=db_deployment.deployed_by,
            DeploymentStatus=db_deployment.deployment_status,
            DeploymentEnvironment=db_deployment.deployment_environment,
            ServerInfo=db_deployment.server_info,
            CompletionDate=db_deployment.completion_date,
            Notes=db_deployment.notes,
            EngineerAssignments=engineer_assignments,
            CreatedAt=db_deployment.created_at,
            UpdatedAt=db_deployment.updated_at
        )

    @staticmethod
    def get_deployment_record(db: Session, deployment_id: int) -> Optional[schemas.DeploymentRecordInfo]:
        """Get detailed information about a specific deployment record"""
        deployment = db.query(DeploymentRecord)\
            .options(joinedload(DeploymentRecord.engineer_assignments).joinedload(DeploymentEngineer.engineer))\
            .filter(DeploymentRecord.deployment_id == deployment_id)\
            .first()
        
        if not deployment:
            return None
            
        # Convert engineer assignments
        engineer_assignments = []
        for assignment in deployment.engineer_assignments:
            engineer = assignment.engineer
            engineer_assignments.append(schemas.EngineerAssignmentInfo(
                EngineerID=engineer.engineer_id,
                EngineerName=engineer.engineer_name,
                Email=engineer.email,
                Role=assignment.role
            ))
        
        return schemas.DeploymentRecordInfo(
            DeploymentID=deployment.deployment_id,
            LicenseID=deployment.license_id,
            DeploymentType=deployment.deployment_type,
            DeploymentDate=deployment.deployment_date,
            DeployedBy=deployment.deployed_by,
            DeploymentStatus=deployment.deployment_status,
            DeploymentEnvironment=deployment.deployment_environment,
            ServerInfo=deployment.server_info,
            CompletionDate=deployment.completion_date,
            Notes=deployment.notes,
            CreatedAt=deployment.created_at,
            UpdatedAt=deployment.updated_at,
            EngineerAssignments=engineer_assignments
        )

    @staticmethod
    def get_deployment_records(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        license_id: Optional[str] = None,
        deployment_type: Optional[schemas.DeploymentTypeEnum] = None,
        deployment_status: Optional[schemas.DeploymentStatusEnum] = None,
        deployed_by: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[schemas.DeploymentRecordInfo]:
        """Get list of deployment records with filtering options"""
        query = db.query(DeploymentRecord)\
            .options(joinedload(DeploymentRecord.engineer_assignments).joinedload(DeploymentEngineer.engineer))
        
        # Apply filters
        if license_id:
            query = query.filter(DeploymentRecord.license_id == license_id)
        if deployment_type:
            query = query.filter(DeploymentRecord.deployment_type == deployment_type)
        if deployment_status:
            query = query.filter(DeploymentRecord.deployment_status == deployment_status)
        if deployed_by:
            query = query.filter(DeploymentRecord.deployed_by.ilike(f"%{deployed_by}%"))
        if start_date:
            query = query.filter(DeploymentRecord.deployment_date >= start_date)
        if end_date:
            query = query.filter(DeploymentRecord.deployment_date <= end_date)
        
        # Apply pagination
        deployments = query.order_by(DeploymentRecord.deployment_date.desc()).offset(skip).limit(limit).all()
        
        # Convert to schema model with engineer assignments
        result = []
        for deployment in deployments:
            # Convert engineer assignments
            engineer_assignments = []
            for assignment in deployment.engineer_assignments:
                engineer = assignment.engineer
                engineer_assignments.append(schemas.EngineerAssignmentInfo(
                    EngineerID=engineer.engineer_id,
                    EngineerName=engineer.engineer_name,
                    Email=engineer.email,
                    Role=assignment.role
                ))
            
            result.append(schemas.DeploymentRecordInfo(
                DeploymentID=deployment.deployment_id,
                LicenseID=deployment.license_id,
                DeploymentType=deployment.deployment_type,
                DeploymentDate=deployment.deployment_date,
                DeployedBy=deployment.deployed_by,
                DeploymentStatus=deployment.deployment_status,
                DeploymentEnvironment=deployment.deployment_environment,
                ServerInfo=deployment.server_info,
                CompletionDate=deployment.completion_date,
                Notes=deployment.notes,
                CreatedAt=deployment.created_at,
                UpdatedAt=deployment.updated_at,
                EngineerAssignments=engineer_assignments
            ))
        
        return result

    @staticmethod
    def update_deployment_record(
        db: Session, 
        deployment_id: int, 
        deployment_data: schemas.DeploymentRecordUpdate
    ) -> Optional[schemas.DeploymentRecordInfo]:
        """Update deployment record information and engineer assignments"""
        deployment = db.query(DeploymentRecord).filter(DeploymentRecord.deployment_id == deployment_id).first()
        
        if not deployment:
            return None
        
        # Store old status and completion date for license update check
        old_status = deployment.deployment_status
        old_completion_date = deployment.completion_date
        
        # Update fields if provided
        update_data = deployment_data.dict(exclude={"EngineerAssignments"}, exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                # Convert CamelCase to snake_case for database column names
                db_key = ''.join(['_' + c.lower() if c.isupper() else c for c in key]).lstrip('_')
                setattr(deployment, db_key, value)
        
        # Update the last modified date
        deployment.updated_at = datetime.now()
        
        # Update engineer assignments if provided
        if deployment_data.EngineerAssignments is not None:
            # Remove existing assignments
            db.query(DeploymentEngineer).filter(DeploymentEngineer.deployment_id == deployment_id).delete()
            
            # Add new assignments
            for assignment in deployment_data.EngineerAssignments:
                # Verify the engineer exists
                engineer = db.query(FactoryEngineer).filter(FactoryEngineer.engineer_id == assignment.EngineerID).first()
                if not engineer:
                    raise ValueError(f"Engineer with ID {assignment.EngineerID} not found")
                
                # Create the assignment
                db_assignment = DeploymentEngineer(
                    deployment_id=deployment_id,
                    engineer_id=assignment.EngineerID,
                    role=assignment.Role
                )
                
                db.add(db_assignment)
        
        db.commit()
        db.refresh(deployment)
        
        # Update the license if the deployment status changed to COMPLETED
        if deployment_data.DeploymentStatus == schemas.DeploymentStatusEnum.COMPLETED and old_status != "COMPLETED":
            license = db.query(License).filter(License.license_id == deployment.license_id).first()
            if license:
                license.deployment_status = "COMPLETED"
                license.deployment_date = deployment.completion_date or deployment.deployment_date
                license.license_status = "ACTIVE"  # Activate the license once deployment is complete
                license.updated_at = datetime.now()
                db.commit()
        
        # Refresh to get the full deployment with assignments
        deployment = db.query(DeploymentRecord)\
            .options(joinedload(DeploymentRecord.engineer_assignments).joinedload(DeploymentEngineer.engineer))\
            .filter(DeploymentRecord.deployment_id == deployment_id)\
            .first()
        
        # Convert engineer assignments
        engineer_assignments = []
        for assignment in deployment.engineer_assignments:
            engineer = assignment.engineer
            engineer_assignments.append(schemas.EngineerAssignmentInfo(
                EngineerID=engineer.engineer_id,
                EngineerName=engineer.engineer_name,
                Email=engineer.email,
                Role=assignment.role
            ))
        
        # Return the updated deployment
        return schemas.DeploymentRecordInfo(
            DeploymentID=deployment.deployment_id,
            LicenseID=deployment.license_id,
            DeploymentType=deployment.deployment_type,
            DeploymentDate=deployment.deployment_date,
            DeployedBy=deployment.deployed_by,
            DeploymentStatus=deployment.deployment_status,
            DeploymentEnvironment=deployment.deployment_environment,
            ServerInfo=deployment.server_info,
            CompletionDate=deployment.completion_date,
            Notes=deployment.notes,
            CreatedAt=deployment.created_at,
            UpdatedAt=deployment.updated_at,
            EngineerAssignments=engineer_assignments
        )

    @staticmethod
    def delete_deployment_record(db: Session, deployment_id: int) -> bool:
        """Delete a deployment record"""
        deployment = db.query(DeploymentRecord).filter(DeploymentRecord.deployment_id == deployment_id).first()
        
        if not deployment:
            return False
        
        # If this deployment set the license to completed, update the license
        if deployment.deployment_status == "COMPLETED":
            license = db.query(License).filter(License.license_id == deployment.license_id).first()
            if license and license.deployment_status == "COMPLETED":
                # Check if there are other completed deployments for this license
                other_completed = db.query(DeploymentRecord)\
                    .filter(
                        DeploymentRecord.license_id == deployment.license_id,
                        DeploymentRecord.deployment_status == "COMPLETED",
                        DeploymentRecord.deployment_id != deployment_id
                    )\
                    .order_by(DeploymentRecord.completion_date.desc())\
                    .first()
                
                if other_completed:
                    # Update with the most recent completed deployment
                    license.deployment_date = other_completed.completion_date or other_completed.deployment_date
                else:
                    # No other completed deployments, reset to planned
                    license.deployment_status = "PLANNED"
                    license.deployment_date = None
                
                license.updated_at = datetime.now()
                db.commit()
        
        # Delete the deployment (will cascade to engineer assignments)
        db.delete(deployment)
        db.commit()
        
        return True
    
    @staticmethod
    def get_deployment_statistics(db: Session) -> schemas.DeploymentStatistics:
        """Get statistics for deployments"""
        # Total deployments
        total_deployments = db.query(func.count(DeploymentRecord.deployment_id)).scalar()
        
        # Deployments by status
        completed_deployments = db.query(func.count(DeploymentRecord.deployment_id))\
            .filter(DeploymentRecord.deployment_status == "COMPLETED")\
            .scalar()
        
        planned_deployments = db.query(func.count(DeploymentRecord.deployment_id))\
            .filter(DeploymentRecord.deployment_status == "PLANNED")\
            .scalar()
        
        failed_deployments = db.query(func.count(DeploymentRecord.deployment_id))\
            .filter(DeploymentRecord.deployment_status == "FAILED")\
            .scalar()
        
        # Average deployment time (in days) for completed deployments
        try:
            # MySQL compatible way to calculate date difference
            avg_time_query = db.query(
                func.avg(
                    func.datediff(
                        DeploymentRecord.completion_date,
                        DeploymentRecord.deployment_date
                    )
                )
            )\
            .filter(
                DeploymentRecord.deployment_status == "COMPLETED",
                DeploymentRecord.completion_date.isnot(None),
                DeploymentRecord.deployment_date.isnot(None)
            )
            avg_deployment_time = avg_time_query.scalar() or 0.0
        except Exception as e:
            print(f"Error calculating average deployment time: {e}")
            avg_deployment_time = 0.0
        
        # Deployments by type
        deployment_types = db.query(
                DeploymentRecord.deployment_type,
                func.count(DeploymentRecord.deployment_id).label("count")
            )\
            .group_by(DeploymentRecord.deployment_type)\
            .all()
        
        deployments_by_type = {deployment_type: count for deployment_type, count in deployment_types}
        
        return schemas.DeploymentStatistics(
            TotalDeployments=total_deployments,
            CompletedDeployments=completed_deployments,
            PlannedDeployments=planned_deployments,
            FailedDeployments=failed_deployments,
            AverageDeploymentTime=avg_deployment_time,
            DeploymentsByType=deployments_by_type
        )
