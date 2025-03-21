from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.db.database import get_db
from app.services.license_service import LicenseService
from app.schemas import schemas

router = APIRouter()

@router.post("/create_license", response_model=schemas.LicenseIdResponse)
def generate_license_id(license_data: dict = None):
    """Generate a new license ID based on the submitted license details - This is a virtual endpoint
    that will be implemented by the central license server. Currently, it simply generates a random ID,
    but in the future, it will use the license details to determine the appropriate license ID format.
    """
    import random
    import string
    import datetime
    
    # Generate a random license ID with a specific format
    now = datetime.datetime.now()
    year = now.strftime("%Y")
    month = now.strftime("%m")
    
    # In the future, the prefix might be based on the license type or other attributes
    # For now, we'll just use a random 3-letter prefix or base it on the product name if available
    if license_data and "ProductName" in license_data:
        product_name = license_data["ProductName"]
        if "Enterprise" in product_name:
            prefix = "ENT"
        elif "Pro" in product_name:
            prefix = "PRO"
        elif "Basic" in product_name:
            prefix = "BAS"
        else:
            prefix = ''.join(random.choice(string.ascii_uppercase) for _ in range(3))
    else:
        prefix = ''.join(random.choice(string.ascii_uppercase) for _ in range(3))
    
    # Generate a random 6-digit number
    random_digits = ''.join(random.choice(string.digits) for _ in range(6))
    
    # Format: XXX-YYYYMM-NNNNNN
    license_id = f"{prefix}-{year}{month}-{random_digits}"
    
    return {"licenseId": license_id}

@router.post("/", response_model=schemas.LicenseInfo)
def create_license(
    license_data: schemas.LicenseCreate,
    db: Session = Depends(get_db)
):
    """Create a new license"""
    created_license = LicenseService.create_license(db, license_data)
    return created_license

@router.get("/{license_id}", response_model=schemas.LicenseDetailedInfo)
def get_license(
    license_id: str = Path(..., description="The License ID"),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific license"""
    license = LicenseService.get_license(db, license_id)
    if not license:
        raise HTTPException(status_code=404, detail="License not found")
    return license

@router.get("/", response_model=List[schemas.LicenseInfo])
def get_licenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    customer_id: Optional[int] = None,
    status: Optional[schemas.LicenseStatusEnum] = None,
    license_type: Optional[str] = None,
    expiring_before: Optional[date] = None,
    expiring_after: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get list of licenses with pagination and filtering"""
    return LicenseService.get_licenses(
        db,
        skip=skip,
        limit=limit,
        customer_id=customer_id,
        status=status,
        license_type=license_type,
        expiring_before=expiring_before,
        expiring_after=expiring_after
    )

@router.put("/{license_id}", response_model=schemas.LicenseInfo)
def update_license(
    license_data: schemas.LicenseUpdate,
    license_id: str = Path(..., description="The License ID"),
    db: Session = Depends(get_db)
):
    """Update license information"""
    updated_license = LicenseService.update_license(db, license_id, license_data)
    if not updated_license:
        raise HTTPException(status_code=404, detail="License not found")
    return updated_license

@router.delete("/{license_id}", status_code=204)
def delete_license(
    license_id: str = Path(..., description="The License ID"),
    db: Session = Depends(get_db)
):
    """Delete a license"""
    result = LicenseService.delete_license(db, license_id)
    if not result:
        raise HTTPException(status_code=404, detail="License not found")
    return {"message": "License deleted successfully"}

@router.post("/{license_id}/renew", response_model=schemas.LicenseInfo)
def renew_license(
    renewal_data: schemas.PurchaseRecordCreate,
    license_id: str = Path(..., description="The License ID"),
    db: Session = Depends(get_db)
):
    """Renew a license and create a purchase record"""
    if renewal_data.PurchaseType != schemas.PurchaseTypeEnum.RENEWAL:
        raise HTTPException(status_code=400, detail="Purchase type must be RENEWAL")
    
    updated_license = LicenseService.renew_license(db, license_id, renewal_data)
    if not updated_license:
        raise HTTPException(status_code=404, detail="License not found")
    return updated_license

@router.post("/{license_id}/usage", response_model=schemas.LicenseInfo)
def update_usage(
    license_id: str = Path(..., description="The License ID"),
    actual_workspaces: Optional[int] = Query(None, ge=0),
    actual_users: Optional[int] = Query(None, ge=0),
    db: Session = Depends(get_db)
):
    """Update the actual usage of a license"""
    if actual_workspaces is None and actual_users is None:
        raise HTTPException(status_code=400, detail="At least one of actual_workspaces or actual_users must be provided")
    
    updated_license = LicenseService.update_usage(db, license_id, actual_workspaces, actual_users)
    if not updated_license:
        raise HTTPException(status_code=404, detail="License not found")
    return updated_license

@router.get("/expiring/soon", response_model=List[schemas.LicenseInfo])
def get_expiring_licenses(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get licenses that will expire within the specified number of days"""
    return LicenseService.get_licenses_by_expiry(db, days, limit)

@router.get("/statistics/overview", response_model=schemas.LicenseStatistics)
def get_license_statistics(
    db: Session = Depends(get_db)
):
    """Get overview statistics for licenses"""
    return LicenseService.get_licenses_statistics(db)
