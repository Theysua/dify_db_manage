from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import date

from app.db.database import get_db
from app.services.deployment_service import DeploymentService
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.DeploymentRecordInfo)
def create_deployment_record(
    deployment_data: schemas.DeploymentRecordCreate,
    db: Session = Depends(get_db)
):
    """Create a new deployment record with optional engineer assignments"""
    try:
        created_deployment = DeploymentService.create_deployment_record(db, deployment_data)
        return created_deployment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# IMPORTANT: This route must be defined before the /{deployment_id} route
@router.get("/statistics", response_model=schemas.DeploymentStatistics)
def get_deployment_statistics(
    db: Session = Depends(get_db)
):
    """Get statistics for deployments"""
    return DeploymentService.get_deployment_statistics(db)

@router.get("/{deployment_id}", response_model=schemas.DeploymentRecordInfo)
def get_deployment_record(
    deployment_id: int = Path(..., description="The Deployment Record ID"),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific deployment record"""
    deployment = DeploymentService.get_deployment_record(db, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment record not found")
    return deployment


@router.get("/", response_model=List[schemas.DeploymentRecordInfo])
def get_deployment_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    license_id: Optional[str] = None,
    deployment_type: Optional[schemas.DeploymentTypeEnum] = None,
    deployment_status: Optional[schemas.DeploymentStatusEnum] = None,
    deployed_by: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get list of deployment records with pagination and filtering"""
    return DeploymentService.get_deployment_records(
        db,
        skip=skip,
        limit=limit,
        license_id=license_id,
        deployment_type=deployment_type,
        deployment_status=deployment_status,
        deployed_by=deployed_by,
        start_date=start_date,
        end_date=end_date
    )

@router.put("/{deployment_id}", response_model=schemas.DeploymentRecordInfo)
def update_deployment_record(
    deployment_data: schemas.DeploymentRecordUpdate,
    deployment_id: int = Path(..., description="The Deployment Record ID"),
    db: Session = Depends(get_db)
):
    """Update deployment record information"""
    try:
        updated_deployment = DeploymentService.update_deployment_record(db, deployment_id, deployment_data)
        if not updated_deployment:
            raise HTTPException(status_code=404, detail="Deployment record not found")
        return updated_deployment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{deployment_id}", status_code=204)
def delete_deployment_record(
    deployment_id: int = Path(..., description="The Deployment Record ID"),
    db: Session = Depends(get_db)
):
    """Delete a deployment record"""
    result = DeploymentService.delete_deployment_record(db, deployment_id)
    if not result:
        raise HTTPException(status_code=404, detail="Deployment record not found")
    return {"message": "Deployment record deleted successfully"}


