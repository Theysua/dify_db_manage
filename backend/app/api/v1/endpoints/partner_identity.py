#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
合作商身份识别API
用于管理合作商的UUID和邮箱映射
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Body
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api import deps
from app.models.user_models import User
from app.services.partner_identity_service import PartnerIdentityService, PartnerEmailMappingService
from app.schemas import partner_identity_schemas

router = APIRouter()

# ======= 合作商身份识别API =======

@router.post("/identities", response_model=partner_identity_schemas.PartnerIdentityInfo)
def create_partner_identity(
    identity_data: partner_identity_schemas.PartnerIdentityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    创建新的合作商身份识别（UUID）
    
    权限：
    - 仅管理员可以创建
    """
    return PartnerIdentityService.create_identity(db, identity_data)


@router.get("/identities/{identity_id}", response_model=partner_identity_schemas.PartnerIdentityInfo)
def get_partner_identity(
    identity_id: int = Path(..., description="身份识别ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    获取身份识别详情
    
    权限：
    - 仅管理员可以查看
    """
    return PartnerIdentityService.get_identity(db, identity_id)


@router.get("/identities/by-uuid/{api_uuid}", response_model=partner_identity_schemas.PartnerIdentityInfo)
def get_partner_identity_by_uuid(
    api_uuid: str = Path(..., description="API UUID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    通过UUID获取身份识别详情
    
    权限：
    - 仅管理员可以查看
    """
    return PartnerIdentityService.get_identity_by_uuid(db, api_uuid)


@router.get("/partners/{partner_id}/identities", response_model=List[partner_identity_schemas.PartnerIdentityInfo])
def get_partner_identities(
    partner_id: int = Path(..., description="合作商ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    获取特定合作商的所有身份识别
    
    权限：
    - 仅管理员可以查看
    """
    return PartnerIdentityService.get_identities_by_partner(db, partner_id)


@router.put("/identities/{identity_id}", response_model=partner_identity_schemas.PartnerIdentityInfo)
def update_partner_identity(
    identity_data: partner_identity_schemas.PartnerIdentityUpdate,
    identity_id: int = Path(..., description="身份识别ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    更新身份识别信息
    
    权限：
    - 仅管理员可以更新
    """
    return PartnerIdentityService.update_identity(db, identity_id, identity_data)


@router.post("/identities/{identity_id}/regenerate-uuid", response_model=partner_identity_schemas.PartnerIdentityInfo)
def regenerate_uuid(
    identity_id: int = Path(..., description="身份识别ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    重新生成UUID
    
    权限：
    - 仅管理员可以操作
    """
    return PartnerIdentityService.regenerate_uuid(db, identity_id)


@router.delete("/identities/{identity_id}")
def delete_partner_identity(
    identity_id: int = Path(..., description="身份识别ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    删除身份识别
    
    权限：
    - 仅管理员可以删除
    """
    return PartnerIdentityService.delete_identity(db, identity_id)


# ======= 邮箱映射API =======

@router.post("/email-mappings", response_model=partner_identity_schemas.PartnerEmailMappingInfo)
def create_email_mapping(
    mapping_data: partner_identity_schemas.PartnerEmailMappingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    创建新的邮箱映射
    
    权限：
    - 仅管理员可以创建
    """
    return PartnerEmailMappingService.create_email_mapping(db, mapping_data)


@router.get("/email-mappings/{mapping_id}", response_model=partner_identity_schemas.PartnerEmailMappingInfo)
def get_email_mapping(
    mapping_id: int = Path(..., description="映射ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    获取邮箱映射详情
    
    权限：
    - 仅管理员可以查看
    """
    return PartnerEmailMappingService.get_email_mapping(db, mapping_id)


@router.get("/email-mappings/by-email/{email_address}", response_model=partner_identity_schemas.PartnerEmailMappingInfo)
def get_email_mapping_by_email(
    email_address: str = Path(..., description="邮箱地址"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    通过邮箱地址获取映射详情
    
    权限：
    - 仅管理员可以查看
    """
    return PartnerEmailMappingService.get_email_mapping_by_email(db, email_address)


@router.get("/identities/{identity_id}/email-mappings", response_model=List[partner_identity_schemas.PartnerEmailMappingInfo])
def get_email_mappings_by_identity(
    identity_id: int = Path(..., description="身份识别ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    获取特定身份识别的所有邮箱映射
    
    权限：
    - 仅管理员可以查看
    """
    return PartnerEmailMappingService.get_mappings_by_identity(db, identity_id)


@router.delete("/email-mappings/{mapping_id}")
def delete_email_mapping(
    mapping_id: int = Path(..., description="映射ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    删除邮箱映射
    
    权限：
    - 仅管理员可以删除
    """
    return PartnerEmailMappingService.delete_email_mapping(db, mapping_id)
