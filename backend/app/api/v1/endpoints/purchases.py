from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import date

from app.db.database import get_db
from app.services.purchase_service import PurchaseService
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.PurchaseRecordInfo)
def create_purchase_record(
    purchase_data: schemas.PurchaseRecordCreate,
    db: Session = Depends(get_db)
):
    """Create a new purchase record"""
    try:
        created_purchase = PurchaseService.create_purchase_record(db, purchase_data)
        return created_purchase
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{purchase_id}", response_model=schemas.PurchaseRecordInfo)
def get_purchase_record(
    purchase_id: int = Path(..., description="The Purchase Record ID"),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific purchase record"""
    purchase = PurchaseService.get_purchase_record(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase record not found")
    return purchase

@router.get("/", response_model=List[schemas.PurchaseRecordInfo])
def get_purchase_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    license_id: Optional[str] = None,
    purchase_type: Optional[schemas.PurchaseTypeEnum] = None,
    payment_status: Optional[schemas.PaymentStatusEnum] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get list of purchase records with pagination and filtering"""
    return PurchaseService.get_purchase_records(
        db,
        skip=skip,
        limit=limit,
        license_id=license_id,
        purchase_type=purchase_type,
        payment_status=payment_status,
        start_date=start_date,
        end_date=end_date
    )

@router.put("/{purchase_id}", response_model=schemas.PurchaseRecordInfo)
def update_purchase_record(
    purchase_data: schemas.PurchaseRecordUpdate,
    purchase_id: int = Path(..., description="The Purchase Record ID"),
    db: Session = Depends(get_db)
):
    """Update purchase record information"""
    updated_purchase = PurchaseService.update_purchase_record(db, purchase_id, purchase_data)
    if not updated_purchase:
        raise HTTPException(status_code=404, detail="Purchase record not found")
    return updated_purchase

@router.delete("/{purchase_id}", status_code=204)
def delete_purchase_record(
    purchase_id: int = Path(..., description="The Purchase Record ID"),
    db: Session = Depends(get_db)
):
    """Delete a purchase record"""
    result = PurchaseService.delete_purchase_record(db, purchase_id)
    if not result:
        raise HTTPException(status_code=404, detail="Purchase record not found")
    return {"message": "Purchase record deleted successfully"}

@router.get("/revenue/statistics", response_model=Dict[str, Any])
def get_revenue_statistics(
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get revenue statistics for a specific year or the current year"""
    return PurchaseService.get_revenue_statistics(db, year)
