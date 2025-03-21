from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.sales_rep_service import SalesRepService
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.SalesRepInfo)
def create_sales_rep(
    sales_rep_data: schemas.SalesRepCreate,
    db: Session = Depends(get_db)
):
    """Create a new sales representative"""
    created_sales_rep = SalesRepService.create_sales_rep(db, sales_rep_data)
    return created_sales_rep

@router.get("/{sales_rep_id}", response_model=schemas.SalesRepInfo)
def get_sales_rep(
    sales_rep_id: int = Path(..., description="The Sales Rep ID"),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific sales representative"""
    sales_rep = SalesRepService.get_sales_rep(db, sales_rep_id)
    if not sales_rep:
        raise HTTPException(status_code=404, detail="Sales representative not found")
    return sales_rep

@router.get("/", response_model=List[schemas.SalesRepInfo])
def get_sales_reps(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    name: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[schemas.StatusEnum] = None,
    db: Session = Depends(get_db)
):
    """Get list of sales representatives with pagination and filtering"""
    from fastapi.responses import JSONResponse
    import json
    from datetime import datetime
    
    # 自定义JSON编码器处理datetime
    class DateTimeEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            return super().default(obj)
    
    result = SalesRepService.get_sales_reps(
        db,
        skip=skip,
        limit=limit,
        name_filter=name,
        department=department,
        status=status
    )
    
    # 调试输出
    print(f"Total count: {result['total']}, Items: {len(result['items'])}")
    
    # 创建响应，设置分页相关头部
    headers = {
        "X-Total-Count": str(result["total"]),
        "Access-Control-Expose-Headers": "X-Total-Count"
    }
    
    # 将Pydantic模型转换为字典，并处理datetime字段
    items_json = json.loads(json.dumps([sr.dict() for sr in result["items"]], cls=DateTimeEncoder))
    
    # 在响应头中设置总数，同时返回数据列表
    return JSONResponse(content=items_json, headers=headers)

@router.put("/{sales_rep_id}", response_model=schemas.SalesRepInfo)
def update_sales_rep(
    sales_rep_data: schemas.SalesRepUpdate,
    sales_rep_id: int = Path(..., description="The Sales Rep ID"),
    db: Session = Depends(get_db)
):
    """Update sales representative information"""
    updated_sales_rep = SalesRepService.update_sales_rep(db, sales_rep_id, sales_rep_data)
    if not updated_sales_rep:
        raise HTTPException(status_code=404, detail="Sales representative not found")
    return updated_sales_rep

@router.delete("/{sales_rep_id}", status_code=204)
def delete_sales_rep(
    sales_rep_id: int = Path(..., description="The Sales Rep ID"),
    db: Session = Depends(get_db)
):
    """Delete a sales representative"""
    result = SalesRepService.delete_sales_rep(db, sales_rep_id)
    if not result:
        raise HTTPException(status_code=404, detail="Sales representative not found")
    return {"message": "Sales representative deleted successfully"}

@router.get("/{sales_rep_id}/licenses", response_model=List[schemas.LicenseInfo])
def get_sales_rep_licenses(
    sales_rep_id: int = Path(..., description="The Sales Rep ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all licenses managed by a specific sales representative"""
    # First check if sales rep exists
    sales_rep = SalesRepService.get_sales_rep(db, sales_rep_id)
    if not sales_rep:
        raise HTTPException(status_code=404, detail="Sales representative not found")
    
    return SalesRepService.get_sales_rep_licenses(db, sales_rep_id, skip, limit)

@router.get("/{sales_rep_id}/performance", response_model=Dict[str, Any])
def get_sales_rep_performance(
    sales_rep_id: int = Path(..., description="The Sales Rep ID"),
    db: Session = Depends(get_db)
):
    """Get sales performance metrics for a specific sales representative"""
    # First check if sales rep exists
    sales_rep = SalesRepService.get_sales_rep(db, sales_rep_id)
    if not sales_rep:
        raise HTTPException(status_code=404, detail="Sales representative not found")
    
    return SalesRepService.get_sales_performance(db, sales_rep_id)

@router.get("/performance/overview", response_model=Dict[str, Any])
def get_all_sales_reps_performance(
    db: Session = Depends(get_db)
):
    """Get performance metrics for all sales representatives"""
    return SalesRepService.get_sales_performance(db)
