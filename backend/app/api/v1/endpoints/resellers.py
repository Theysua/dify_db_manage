from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.reseller_service import ResellerService
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.ResellerInfo)
def create_reseller(
    reseller_data: schemas.ResellerCreate,
    db: Session = Depends(get_db)
):
    """Create a new reseller"""
    created_reseller = ResellerService.create_reseller(db, reseller_data)
    return created_reseller

@router.get("/{reseller_id}", response_model=schemas.ResellerInfo)
def get_reseller(
    reseller_id: int = Path(..., description="The Reseller ID"),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific reseller"""
    reseller = ResellerService.get_reseller(db, reseller_id)
    if not reseller:
        raise HTTPException(status_code=404, detail="Reseller not found")
    return reseller

@router.get("/", response_model=List[schemas.ResellerInfo])
def get_resellers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    name: Optional[str] = None,
    partner_level: Optional[str] = None,
    region: Optional[str] = None,
    status: Optional[schemas.StatusEnum] = None,
    db: Session = Depends(get_db)
):
    """Get list of resellers with pagination and filtering"""
    return ResellerService.get_resellers(
        db,
        skip=skip,
        limit=limit,
        name_filter=name,
        partner_level=partner_level,
        region=region,
        status=status
    )

@router.put("/{reseller_id}", response_model=schemas.ResellerInfo)
def update_reseller(
    reseller_data: schemas.ResellerUpdate,
    reseller_id: int = Path(..., description="The Reseller ID"),
    db: Session = Depends(get_db)
):
    """Update reseller information"""
    updated_reseller = ResellerService.update_reseller(db, reseller_id, reseller_data)
    if not updated_reseller:
        raise HTTPException(status_code=404, detail="Reseller not found")
    return updated_reseller

@router.delete("/{reseller_id}", status_code=204)
def delete_reseller(
    reseller_id: int = Path(..., description="The Reseller ID"),
    db: Session = Depends(get_db)
):
    """Delete a reseller"""
    result = ResellerService.delete_reseller(db, reseller_id)
    if not result:
        raise HTTPException(status_code=404, detail="Reseller not found")
    return {"message": "Reseller deleted successfully"}

@router.get("/{reseller_id}/licenses", response_model=List[schemas.LicenseInfo])
def get_reseller_licenses(
    reseller_id: int = Path(..., description="The Reseller ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all licenses associated with a specific reseller"""
    # First check if reseller exists
    reseller = ResellerService.get_reseller(db, reseller_id)
    if not reseller:
        raise HTTPException(status_code=404, detail="Reseller not found")
    
    return ResellerService.get_reseller_licenses(db, reseller_id, skip, limit)

@router.get("/{reseller_id}/performance", response_model=Dict[str, Any])
def get_reseller_performance(
    reseller_id: int = Path(..., description="The Reseller ID"),
    db: Session = Depends(get_db)
):
    """Get sales performance metrics for a specific reseller"""
    # First check if reseller exists
    reseller = ResellerService.get_reseller(db, reseller_id)
    if not reseller:
        raise HTTPException(status_code=404, detail="Reseller not found")
    
    return ResellerService.get_reseller_performance(db, reseller_id)

@router.get("/performance/overview", response_model=Dict[str, Any])
def get_all_resellers_performance(
    db: Session = Depends(get_db)
):
    """Get performance metrics for all resellers"""
    return ResellerService.get_reseller_performance(db)
