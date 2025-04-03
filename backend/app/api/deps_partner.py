#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
合作商API身份验证依赖项
"""

from typing import Optional
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.partner_identity_models import PartnerIdentity
from app.models.partner_models import Partner


async def get_partner_by_uuid(
    x_partner_uuid: str = Header(..., description="合作商API UUID"),
    db: Session = Depends(get_db)
) -> Partner:
    """
    通过UUID验证合作商身份
    用于需要合作商身份验证的API端点
    """
    # 验证UUID是否存在
    identity = db.query(PartnerIdentity).filter(
        PartnerIdentity.api_uuid == x_partner_uuid,
        PartnerIdentity.is_active == True
    ).first()
    
    if not identity:
        raise HTTPException(
            status_code=401,
            detail="无效的合作商UUID或UUID已被禁用",
            headers={"WWW-Authenticate": "PartnerUUID"}
        )
    
    # 获取关联的合作商
    partner = db.query(Partner).filter(
        Partner.partner_id == identity.partner_id,
        Partner.status == "ACTIVE"
    ).first()
    
    if not partner:
        raise HTTPException(
            status_code=401,
            detail="合作商账号不存在或已被禁用",
            headers={"WWW-Authenticate": "PartnerUUID"}
        )
    
    return partner


async def get_partner_identity_by_uuid(
    x_partner_uuid: str = Header(..., description="合作商API UUID"),
    db: Session = Depends(get_db)
) -> PartnerIdentity:
    """
    通过UUID获取合作商身份识别详情
    用于需要访问身份识别信息的API端点
    """
    # 验证UUID是否存在
    identity = db.query(PartnerIdentity).filter(
        PartnerIdentity.api_uuid == x_partner_uuid,
        PartnerIdentity.is_active == True
    ).first()
    
    if not identity:
        raise HTTPException(
            status_code=401,
            detail="无效的合作商UUID或UUID已被禁用",
            headers={"WWW-Authenticate": "PartnerUUID"}
        )
    
    return identity
