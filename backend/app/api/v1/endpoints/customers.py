from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.customer_service import CustomerService
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.CustomerInfo)
def create_customer(
    customer_data: schemas.CustomerCreate,
    db: Session = Depends(get_db)
):
    """Create a new customer"""
    created_customer = CustomerService.create_customer(db, customer_data)
    return created_customer

@router.get("/{customer_id}", response_model=schemas.CustomerInfo)
def get_customer(
    customer_id: int = Path(..., description="The Customer ID"),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific customer"""
    customer = CustomerService.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.get("/", response_model=List[schemas.CustomerInfo])
def get_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    name: Optional[str] = None,
    industry: Optional[str] = None,
    region: Optional[str] = None,
    customer_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of customers with pagination and filtering"""
    return CustomerService.get_customers(
        db,
        skip=skip,
        limit=limit,
        name_filter=name,
        industry=industry,
        region=region,
        customer_type=customer_type
    )

@router.put("/{customer_id}", response_model=schemas.CustomerInfo)
def update_customer(
    customer_data: schemas.CustomerUpdate,
    customer_id: int = Path(..., description="The Customer ID"),
    db: Session = Depends(get_db)
):
    """Update customer information"""
    updated_customer = CustomerService.update_customer(db, customer_id, customer_data)
    if not updated_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated_customer

@router.delete("/{customer_id}", status_code=204)
def delete_customer(
    customer_id: int = Path(..., description="The Customer ID"),
    db: Session = Depends(get_db)
):
    """Delete a customer and all associated licenses"""
    result = CustomerService.delete_customer(db, customer_id)
    if not result:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}

@router.get("/{customer_id}/licenses", response_model=List[schemas.LicenseInfo])
def get_customer_licenses(
    customer_id: int = Path(..., description="The Customer ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all licenses for a specific customer"""
    # First check if customer exists
    customer = CustomerService.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return CustomerService.get_customer_licenses(db, customer_id, skip, limit)

@router.get("/statistics/overview", response_model=schemas.CustomerStatistics)
def get_customer_statistics(
    db: Session = Depends(get_db)
):
    """Get overview statistics for customers"""
    return CustomerService.get_customer_statistics(db)
