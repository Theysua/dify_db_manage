from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.engineer_service import EngineerService
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.EngineerInfo)
def create_engineer(
    engineer_data: schemas.EngineerCreate,
    db: Session = Depends(get_db)
):
    """Create a new factory engineer"""
    created_engineer = EngineerService.create_engineer(db, engineer_data)
    return created_engineer

@router.get("/{engineer_id}", response_model=schemas.EngineerInfo)
def get_engineer(
    engineer_id: int = Path(..., description="The Engineer ID"),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific engineer"""
    engineer = EngineerService.get_engineer(db, engineer_id)
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found")
    return engineer

@router.get("/", response_model=List[schemas.EngineerInfo])
def get_engineers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    name: Optional[str] = None,
    specialization: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[schemas.StatusEnum] = None,
    db: Session = Depends(get_db)
):
    """Get list of engineers with pagination and filtering"""
    return EngineerService.get_engineers(
        db,
        skip=skip,
        limit=limit,
        name_filter=name,
        specialization=specialization,
        department=department,
        status=status
    )

@router.put("/{engineer_id}", response_model=schemas.EngineerInfo)
def update_engineer(
    engineer_data: schemas.EngineerUpdate,
    engineer_id: int = Path(..., description="The Engineer ID"),
    db: Session = Depends(get_db)
):
    """Update engineer information"""
    updated_engineer = EngineerService.update_engineer(db, engineer_id, engineer_data)
    if not updated_engineer:
        raise HTTPException(status_code=404, detail="Engineer not found")
    return updated_engineer

@router.delete("/{engineer_id}", status_code=204)
def delete_engineer(
    engineer_id: int = Path(..., description="The Engineer ID"),
    db: Session = Depends(get_db)
):
    """Delete an engineer"""
    try:
        result = EngineerService.delete_engineer(db, engineer_id)
        if not result:
            raise HTTPException(status_code=404, detail="Engineer not found")
        return {"message": "Engineer deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{engineer_id}/deployments", response_model=List[schemas.DeploymentRecordInfo])
def get_engineer_deployments(
    engineer_id: int = Path(..., description="The Engineer ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all deployments associated with a specific engineer"""
    # First check if engineer exists
    engineer = EngineerService.get_engineer(db, engineer_id)
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found")
    
    return EngineerService.get_engineer_deployments(db, engineer_id, skip, limit)

@router.get("/{engineer_id}/workload", response_model=Dict[str, Any])
def get_engineer_workload(
    engineer_id: int = Path(..., description="The Engineer ID"),
    db: Session = Depends(get_db)
):
    """Get workload statistics for a specific engineer"""
    # First check if engineer exists
    engineer = EngineerService.get_engineer(db, engineer_id)
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found")
    
    return EngineerService.get_engineer_workload(db, engineer_id)

@router.get("/workload/overview", response_model=Dict[str, Any])
def get_all_engineers_workload(
    db: Session = Depends(get_db)
):
    """Get workload statistics for all engineers"""
    return EngineerService.get_engineer_workload(db)
