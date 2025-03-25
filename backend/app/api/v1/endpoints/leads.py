from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user_models import User
from app.schemas import lead_schemas
from app.services import lead_service

router = APIRouter()


# 商机来源管理
@router.post("/sources/", response_model=lead_schemas.LeadSource, status_code=201, summary="创建商机来源")
def create_lead_source(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
    source_in: lead_schemas.LeadSourceCreate
):
    """
    创建新的商机来源。
    只有管理员可以创建商机来源。
    """
    return lead_service.create_lead_source(db=db, source=source_in)


@router.get("/sources/", response_model=List[lead_schemas.LeadSource], summary="获取所有商机来源")
def read_lead_sources(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """
    获取所有商机来源的列表。
    所有活跃用户都可以查看商机来源。
    """
    return lead_service.get_lead_sources(db=db, skip=skip, limit=limit)


@router.get("/sources/{source_id}", response_model=lead_schemas.LeadSource, summary="获取特定商机来源")
def read_lead_source(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    source_id: int = Path(..., title="要获取的商机来源ID")
):
    """
    获取特定商机来源的详细信息。
    所有活跃用户都可以查看具体的商机来源。
    """
    return lead_service.get_lead_source(db=db, source_id=source_id)


@router.put("/sources/{source_id}", response_model=lead_schemas.LeadSource, summary="更新商机来源")
def update_lead_source(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
    source_id: int = Path(..., title="要更新的商机来源ID"),
    source_in: lead_schemas.LeadSourceUpdate
):
    """
    更新现有商机来源的信息。
    只有管理员可以更新商机来源。
    """
    return lead_service.update_lead_source(db=db, source_id=source_id, source=source_in)


# 商机状态管理
@router.post("/statuses/", response_model=lead_schemas.LeadStatus, status_code=201, summary="创建商机状态")
def create_lead_status(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
    status_in: lead_schemas.LeadStatusCreate
):
    """
    创建新的商机状态。
    只有管理员可以创建商机状态。
    """
    return lead_service.create_lead_status(db=db, status=status_in)


@router.get("/statuses/", response_model=List[lead_schemas.LeadStatus], summary="获取所有商机状态")
def read_lead_statuses(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
):
    """
    获取所有商机状态的列表。
    所有活跃用户都可以查看商机状态。
    """
    return lead_service.get_lead_statuses(db=db, skip=skip, limit=limit)


@router.get("/statuses/{status_id}", response_model=lead_schemas.LeadStatus, summary="获取特定商机状态")
def read_lead_status(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    status_id: int = Path(..., title="要获取的商机状态ID")
):
    """
    获取特定商机状态的详细信息。
    所有活跃用户都可以查看具体的商机状态。
    """
    return lead_service.get_lead_status(db=db, status_id=status_id)


@router.put("/statuses/{status_id}", response_model=lead_schemas.LeadStatus, summary="更新商机状态")
def update_lead_status(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
    status_id: int = Path(..., title="要更新的商机状态ID"),
    status_in: lead_schemas.LeadStatusUpdate
):
    """
    更新现有商机状态的信息。
    只有管理员可以更新商机状态。
    """
    return lead_service.update_lead_status(db=db, status_id=status_id, status=status_in)


# 商机管理
@router.post("/", response_model=lead_schemas.Lead, status_code=201, summary="创建商机")
def create_lead(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_field_staff),
    lead_in: lead_schemas.LeadCreate
):
    """
    创建新的商机。
    管理员、销售代表和合作伙伴可以创建商机。
    """
    return lead_service.create_lead(db=db, lead=lead_in)


@router.get("/", response_model=List[lead_schemas.Lead], summary="获取商机列表")
def read_leads(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    status_id: Optional[int] = Query(None, description="按商机状态筛选"),
    sales_rep_id: Optional[int] = Query(None, description="按销售代表筛选"),
    partner_id: Optional[int] = Query(None, description="按合作伙伴筛选"),
    source_id: Optional[int] = Query(None, description="按商机来源筛选"),
    search: Optional[str] = Query(None, description="搜索商机名称、公司名称、联系人或邮箱")
):
    """
    获取商机列表，支持分页和多条件筛选。
    - 管理员可以查看所有商机
    - 销售代表可以查看所有商机
    - 工程师可以查看所有商机
    - 合作伙伴只能查看与自己相关的商机
    """
    # 根据角色限制查询
    if current_user.role == "partner":
        partner_id = current_user.partner_id  # 合作伙伴只能看到自己的商机
    
    return lead_service.get_leads(
        db=db, 
        skip=skip, 
        limit=limit,
        status_id=status_id,
        sales_rep_id=sales_rep_id,
        partner_id=partner_id,
        source_id=source_id,
        search_term=search
    )


@router.get("/funnel", response_model=lead_schemas.LeadFunnelData, summary="获取销售漏斗数据")
def read_lead_funnel(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_sales_rep)
):
    """
    获取销售漏斗数据，包括各阶段商机数量和金额。
    只有管理员和销售代表可以查看销售漏斗数据。
    """
    return lead_service.get_lead_funnel_data(db=db)


@router.get("/{lead_id}", response_model=lead_schemas.Lead, summary="获取特定商机")
def read_lead(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    lead_id: int = Path(..., title="要获取的商机ID")
):
    """
    获取特定商机的详细信息。
    - 管理员可以查看任何商机
    - 销售代表可以查看所有商机
    - 工程师可以查看所有商机
    - 合作伙伴只能查看与自己相关的商机
    """
    lead = lead_service.get_lead(db=db, lead_id=lead_id)
    
    # 权限检查
    if current_user.role == "partner" and lead.partner_id != current_user.partner_id:
        raise HTTPException(status_code=403, detail="没有权限访问此商机")
    
    return lead


@router.put("/{lead_id}", response_model=lead_schemas.Lead, summary="更新商机")
def update_lead(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_sales_rep),
    lead_id: int = Path(..., title="要更新的商机ID"),
    lead_in: lead_schemas.LeadUpdate
):
    """
    更新现有商机的信息。
    只有管理员和销售代表可以更新商机。
    """
    return lead_service.update_lead(db=db, lead_id=lead_id, lead=lead_in)


@router.patch("/{lead_id}/status", response_model=lead_schemas.Lead, summary="更新商机状态")
def update_lead_status(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_sales_rep),
    lead_id: int = Path(..., title="要更新状态的商机ID"),
    status_update: lead_schemas.LeadStatusUpdate
):
    """
    更新现有商机的状态。
    只有管理员和销售代表可以更新商机状态。
    """
    return lead_service.update_lead_status_only(db=db, lead_id=lead_id, status_update=status_update)


@router.delete("/{lead_id}", response_model=Dict[str, bool], summary="删除商机")
def delete_lead(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
    lead_id: int = Path(..., title="要删除的商机ID")
):
    """
    删除现有商机。
    只有管理员可以删除商机。
    """
    return lead_service.delete_lead(db=db, lead_id=lead_id)


# 商机活动管理
@router.post("/{lead_id}/activities", response_model=lead_schemas.LeadActivity, status_code=201, summary="添加商机活动")
def create_lead_activity(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_sales_rep),
    lead_id: int = Path(..., title="商机ID"),
    activity_in: lead_schemas.LeadActivityCreate
):
    """
    为商机添加新的活动记录。
    只有管理员和销售代表可以添加商机活动。
    """
    if activity_in.lead_id != lead_id:
        raise HTTPException(status_code=400, detail="活动的商机ID与路径中的商机ID不匹配")
    
    return lead_service.create_lead_activity(db=db, activity=activity_in)


@router.get("/{lead_id}/activities", response_model=List[lead_schemas.LeadActivity], summary="获取商机活动列表")
def read_lead_activities(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    lead_id: int = Path(..., title="商机ID"),
    skip: int = 0,
    limit: int = 100
):
    """
    获取特定商机的活动记录列表。
    所有活跃用户都可以查看商机活动，但须符合商机的访问权限。
    """
    # 首先检查用户是否有权限访问此商机
    lead = lead_service.get_lead(db=db, lead_id=lead_id)
    
    if current_user.role == "partner" and lead.partner_id != current_user.partner_id:
        raise HTTPException(status_code=403, detail="没有权限访问此商机的活动")
    
    return lead_service.get_lead_activities(db=db, lead_id=lead_id, skip=skip, limit=limit)


@router.put("/{lead_id}/activities/{activity_id}", response_model=lead_schemas.LeadActivity, summary="更新商机活动")
def update_lead_activity(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_sales_rep),
    lead_id: int = Path(..., title="商机ID"),
    activity_id: int = Path(..., title="活动ID"),
    activity_in: lead_schemas.LeadActivityUpdate
):
    """
    更新商机活动记录。
    只有管理员和销售代表可以更新商机活动。
    """
    return lead_service.update_lead_activity(db=db, activity_id=activity_id, activity=activity_in)


@router.delete("/{lead_id}/activities/{activity_id}", response_model=Dict[str, bool], summary="删除商机活动")
def delete_lead_activity(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_sales_rep),
    lead_id: int = Path(..., title="商机ID"),
    activity_id: int = Path(..., title="活动ID")
):
    """
    删除商机活动记录。
    只有管理员和销售代表可以删除商机活动。
    """
    return lead_service.delete_lead_activity(db=db, activity_id=activity_id)
