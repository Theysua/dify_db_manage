from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.models import FactoryEngineer, DeploymentEngineer, DeploymentRecord
from app.schemas import schemas


class EngineerService:
    @staticmethod
    def create_engineer(db: Session, engineer_data: schemas.EngineerCreate) -> FactoryEngineer:
        """Create a new factory engineer record"""
        db_engineer = FactoryEngineer(
            engineer_name=engineer_data.EngineerName,
            email=engineer_data.Email,
            phone=engineer_data.Phone,
            expertise=engineer_data.Expertise,  # 使用新的expertise字段
            department=engineer_data.Department,
            status=engineer_data.Status
        )
        
        db.add(db_engineer)
        db.commit()
        db.refresh(db_engineer)
        
        return db_engineer

    @staticmethod
    def get_engineer(db: Session, engineer_id: int) -> Optional[schemas.EngineerInfo]:
        """Get information about a specific engineer"""
        engineer = db.query(FactoryEngineer).filter(FactoryEngineer.engineer_id == engineer_id).first()
        
        if not engineer:
            return None
            
        return schemas.EngineerInfo(
            EngineerID=engineer.engineer_id,
            EngineerName=engineer.engineer_name,
            Email=engineer.email,
            Phone=engineer.phone,
            Expertise=engineer.expertise,
            Department=engineer.department,
            Status=engineer.status,
            CreatedAt=engineer.created_at,
            UpdatedAt=engineer.updated_at
        )

    @staticmethod
    def get_engineers(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        name_filter: Optional[str] = None,
        expertise: Optional[str] = None,
        department: Optional[str] = None,
        status: Optional[schemas.StatusEnum] = None
    ) -> Dict[str, Any]:
        """Get list of engineers with filtering options and total count"""
        query = db.query(FactoryEngineer)
        
        # Apply filters
        if name_filter:
            query = query.filter(FactoryEngineer.engineer_name.ilike(f"%{name_filter}%"))
        if expertise:
            query = query.filter(FactoryEngineer.expertise == expertise)
        if department:
            query = query.filter(FactoryEngineer.department == department)
        if status:
            query = query.filter(FactoryEngineer.status == status)
        
        # Get total count (before pagination)
        total_count = query.count()
        
        # Apply pagination
        engineers = query.order_by(FactoryEngineer.engineer_name).offset(skip).limit(limit).all()
        
        # Convert to schema model
        result = [
            schemas.EngineerInfo(
                EngineerID=engineer.engineer_id,
                EngineerName=engineer.engineer_name,
                Email=engineer.email,
                Phone=engineer.phone,
                Expertise=engineer.expertise,
                Department=engineer.department,
                Status=engineer.status,
                CreatedAt=engineer.created_at,
                UpdatedAt=engineer.updated_at
            )
            for engineer in engineers
        ]
        
        return {
            "items": result,
            "total": total_count
        }

    @staticmethod
    def update_engineer(
        db: Session, 
        engineer_id: int, 
        engineer_data: schemas.EngineerUpdate
    ) -> Optional[schemas.EngineerInfo]:
        """Update engineer information"""
        engineer = db.query(FactoryEngineer).filter(FactoryEngineer.engineer_id == engineer_id).first()
        
        if not engineer:
            return None
        
        # Update fields if provided
        update_data = engineer_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                # Convert CamelCase to snake_case for database column names
                db_key = ''.join(['_' + c.lower() if c.isupper() else c for c in key]).lstrip('_')
                setattr(engineer, db_key, value)
        
        # Update the last modified date
        engineer.updated_at = datetime.now()
        
        db.commit()
        db.refresh(engineer)
        
        # Return the updated engineer
        return schemas.EngineerInfo(
            EngineerID=engineer.engineer_id,
            EngineerName=engineer.engineer_name,
            Email=engineer.email,
            Phone=engineer.phone,
            Expertise=engineer.expertise,
            Department=engineer.department,
            Status=engineer.status,
            CreatedAt=engineer.created_at,
            UpdatedAt=engineer.updated_at
        )

    @staticmethod
    def delete_engineer(db: Session, engineer_id: int) -> bool:
        """Delete an engineer"""
        engineer = db.query(FactoryEngineer).filter(FactoryEngineer.engineer_id == engineer_id).first()
        
        if not engineer:
            return False
        
        # Check if engineer is assigned to any active deployments
        active_assignments = db.query(DeploymentEngineer)\
            .join(DeploymentRecord, DeploymentRecord.deployment_id == DeploymentEngineer.deployment_id)\
            .filter(
                DeploymentEngineer.engineer_id == engineer_id,
                DeploymentRecord.deployment_status.in_(["PLANNED", "IN_PROGRESS"])
            )\
            .first()
        
        if active_assignments:
            raise ValueError("Cannot delete engineer with active deployment assignments. Reassign or complete deployments first.")
        
        db.delete(engineer)
        db.commit()
        
        return True
    
    @staticmethod
    def get_engineer_deployments(
        db: Session, 
        engineer_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[schemas.DeploymentRecordInfo]:
        """Get all deployments for a specific engineer"""
        from app.services.deployment_service import DeploymentService
        
        # Check if engineer exists
        engineer = db.query(FactoryEngineer).filter(FactoryEngineer.engineer_id == engineer_id).first()
        if not engineer:
            return []
        
        # Get deployment IDs assigned to the engineer
        deployment_ids = db.query(DeploymentEngineer.deployment_id)\
            .filter(DeploymentEngineer.engineer_id == engineer_id)\
            .offset(skip).limit(limit)\
            .all()
        
        deployment_ids = [id[0] for id in deployment_ids]
        
        # If no deployments found
        if not deployment_ids:
            return []
        
        # Get the deployment records using the deployment service
        deployment_records = []
        for deployment_id in deployment_ids:
            deployment = DeploymentService.get_deployment_record(db, deployment_id)
            if deployment:
                deployment_records.append(deployment)
        
        return deployment_records
    
    @staticmethod
    def get_engineer_workload(db: Session, engineer_id: Optional[int] = None) -> Dict[str, Any]:
        """Get workload statistics for a specific engineer or all engineers"""
        from datetime import datetime
        
        # Base query to count active deployments per engineer
        query = db.query(
                FactoryEngineer.engineer_id,
                FactoryEngineer.engineer_name,
                func.count(DeploymentEngineer.deployment_id).label("active_deployments")
            )\
            .join(DeploymentEngineer, DeploymentEngineer.engineer_id == FactoryEngineer.engineer_id)\
            .join(DeploymentRecord, DeploymentRecord.deployment_id == DeploymentEngineer.deployment_id)\
            .filter(DeploymentRecord.deployment_status.in_(["PLANNED", "IN_PROGRESS"]))\
            .group_by(FactoryEngineer.engineer_id, FactoryEngineer.engineer_name)
        
        # If engineer_id is provided, filter by that engineer
        if engineer_id:
            query = query.filter(FactoryEngineer.engineer_id == engineer_id)
        
        # Execute the query
        results = query.all()
        
        # Format the results
        if engineer_id:
            # Single engineer workload
            if not results:
                # Engineer exists but has no active deployments
                engineer = db.query(FactoryEngineer).filter(FactoryEngineer.engineer_id == engineer_id).first()
                if engineer:
                    return {
                        "engineer_id": engineer.engineer_id,
                        "engineer_name": engineer.engineer_name,
                        "active_deployments": 0,
                        "recent_deployments": []
                    }
                return {
                    "engineer_id": engineer_id,
                    "engineer_name": "Unknown Engineer",
                    "active_deployments": 0,
                    "recent_deployments": []
                }
                
            result = results[0]
            
            # Get recent deployment details
            recent_deployments = db.query(
                    DeploymentRecord.deployment_id,
                    DeploymentRecord.license_id,
                    DeploymentRecord.deployment_type,
                    DeploymentRecord.deployment_date,
                    DeploymentRecord.deployment_status
                )\
                .join(DeploymentEngineer, DeploymentEngineer.deployment_id == DeploymentRecord.deployment_id)\
                .filter(
                    DeploymentEngineer.engineer_id == engineer_id,
                    DeploymentRecord.deployment_status.in_(["PLANNED", "IN_PROGRESS"])
                )\
                .order_by(DeploymentRecord.deployment_date)\
                .limit(5)\
                .all()
            
            return {
                "engineer_id": result.engineer_id,
                "engineer_name": result.engineer_name,
                "active_deployments": result.active_deployments,
                "recent_deployments": [
                    {
                        "deployment_id": dep[0],
                        "license_id": dep[1],
                        "deployment_type": dep[2],
                        "deployment_date": dep[3].isoformat() if dep[3] else None,
                        "deployment_status": dep[4]
                    }
                    for dep in recent_deployments
                ]
            }
        else:
            # All engineers workload
            return {
                "engineers": [
                    {
                        "engineer_id": result.engineer_id,
                        "engineer_name": result.engineer_name,
                        "active_deployments": result.active_deployments
                    }
                    for result in results
                ],
                "total_active_deployments": sum(result.active_deployments for result in results)
            }
