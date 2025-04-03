#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
合作商身份识别服务
处理UUID管理、邮箱映射关系
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.partner_models import Partner
from app.models.partner_identity_models import PartnerIdentity, PartnerEmailMapping
from app.schemas import partner_identity_schemas


class PartnerIdentityService:
    """合作商身份识别服务"""
    
    @staticmethod
    def create_identity(db: Session, identity_data: partner_identity_schemas.PartnerIdentityCreate) -> PartnerIdentity:
        """创建新的合作商身份识别"""
        # 验证合作商是否存在
        partner = db.query(Partner).filter(Partner.partner_id == identity_data.partner_id).first()
        if not partner:
            raise HTTPException(status_code=404, detail=f"合作商ID '{identity_data.partner_id}' 不存在")
        
        # 创建新的UUID
        api_uuid = PartnerIdentity.generate_uuid()
        
        # 创建身份识别记录
        new_identity = PartnerIdentity(
            partner_id=identity_data.partner_id,
            api_uuid=api_uuid,
            description=identity_data.description,
            is_active=identity_data.is_active
        )
        
        db.add(new_identity)
        db.commit()
        db.refresh(new_identity)
        
        return new_identity
    
    @staticmethod
    def get_identity(db: Session, identity_id: int) -> PartnerIdentity:
        """获取身份识别详情"""
        identity = db.query(PartnerIdentity).filter(PartnerIdentity.identity_id == identity_id).first()
        if not identity:
            raise HTTPException(status_code=404, detail=f"身份识别ID '{identity_id}' 不存在")
        
        return identity
    
    @staticmethod
    def get_identity_by_uuid(db: Session, api_uuid: str) -> PartnerIdentity:
        """通过UUID获取身份识别详情"""
        identity = db.query(PartnerIdentity).filter(PartnerIdentity.api_uuid == api_uuid).first()
        if not identity:
            raise HTTPException(status_code=404, detail=f"API UUID '{api_uuid}' 不存在")
        
        return identity
    
    @staticmethod
    def update_identity(
        db: Session, 
        identity_id: int, 
        identity_data: partner_identity_schemas.PartnerIdentityUpdate
    ) -> PartnerIdentity:
        """更新身份识别信息"""
        identity = PartnerIdentityService.get_identity(db, identity_id)
        
        # 更新字段
        for key, value in identity_data.dict(exclude_unset=True).items():
            setattr(identity, key, value)
        
        db.commit()
        db.refresh(identity)
        
        return identity
    
    @staticmethod
    def delete_identity(db: Session, identity_id: int) -> Dict[str, Any]:
        """删除身份识别记录"""
        identity = PartnerIdentityService.get_identity(db, identity_id)
        
        db.delete(identity)
        db.commit()
        
        return {"message": f"身份识别ID '{identity_id}' 已删除"}
    
    @staticmethod
    def get_identities_by_partner(db: Session, partner_id: int) -> List[PartnerIdentity]:
        """获取特定合作商的所有身份识别记录"""
        # 验证合作商是否存在
        partner = db.query(Partner).filter(Partner.partner_id == partner_id).first()
        if not partner:
            raise HTTPException(status_code=404, detail=f"合作商ID '{partner_id}' 不存在")
        
        identities = db.query(PartnerIdentity).filter(PartnerIdentity.partner_id == partner_id).all()
        return identities
    
    @staticmethod
    def regenerate_uuid(db: Session, identity_id: int) -> PartnerIdentity:
        """重新生成身份识别的UUID"""
        identity = PartnerIdentityService.get_identity(db, identity_id)
        
        # 生成新的UUID
        identity.api_uuid = PartnerIdentity.generate_uuid()
        
        db.commit()
        db.refresh(identity)
        
        return identity


class PartnerEmailMappingService:
    """合作商邮箱映射服务"""
    
    @staticmethod
    def create_email_mapping(
        db: Session, 
        mapping_data: partner_identity_schemas.PartnerEmailMappingCreate
    ) -> PartnerEmailMapping:
        """创建新的邮箱映射"""
        # 验证身份识别是否存在
        identity = db.query(PartnerIdentity).filter(
            PartnerIdentity.identity_id == mapping_data.identity_id
        ).first()
        if not identity:
            raise HTTPException(status_code=404, detail=f"身份识别ID '{mapping_data.identity_id}' 不存在")
        
        # 检查邮箱是否已存在
        existing_mapping = db.query(PartnerEmailMapping).filter(
            PartnerEmailMapping.email_address == mapping_data.email_address
        ).first()
        if existing_mapping:
            raise HTTPException(status_code=400, detail=f"邮箱 '{mapping_data.email_address}' 已存在映射关系")
        
        # 创建邮箱映射
        new_mapping = PartnerEmailMapping(
            identity_id=mapping_data.identity_id,
            email_address=mapping_data.email_address,
            description=mapping_data.description
        )
        
        db.add(new_mapping)
        db.commit()
        db.refresh(new_mapping)
        
        return new_mapping
    
    @staticmethod
    def get_email_mapping(db: Session, mapping_id: int) -> PartnerEmailMapping:
        """获取邮箱映射详情"""
        mapping = db.query(PartnerEmailMapping).filter(
            PartnerEmailMapping.mapping_id == mapping_id
        ).first()
        if not mapping:
            raise HTTPException(status_code=404, detail=f"邮箱映射ID '{mapping_id}' 不存在")
        
        return mapping
    
    @staticmethod
    def get_email_mapping_by_email(db: Session, email_address: str) -> PartnerEmailMapping:
        """通过邮箱地址获取映射详情"""
        mapping = db.query(PartnerEmailMapping).filter(
            PartnerEmailMapping.email_address == email_address
        ).first()
        if not mapping:
            raise HTTPException(status_code=404, detail=f"邮箱 '{email_address}' 未找到映射关系")
        
        return mapping
    
    @staticmethod
    def get_identity_by_email(db: Session, email_address: str) -> PartnerIdentity:
        """通过邮箱地址获取关联的身份识别详情"""
        mapping = PartnerEmailMappingService.get_email_mapping_by_email(db, email_address)
        return mapping.identity
    
    @staticmethod
    def delete_email_mapping(db: Session, mapping_id: int) -> Dict[str, Any]:
        """删除邮箱映射记录"""
        mapping = PartnerEmailMappingService.get_email_mapping(db, mapping_id)
        
        db.delete(mapping)
        db.commit()
        
        return {"message": f"邮箱映射ID '{mapping_id}' 已删除"}
    
    @staticmethod
    def get_mappings_by_identity(db: Session, identity_id: int) -> List[PartnerEmailMapping]:
        """获取特定身份识别的所有邮箱映射记录"""
        # 验证身份识别是否存在
        identity = db.query(PartnerIdentity).filter(
            PartnerIdentity.identity_id == identity_id
        ).first()
        if not identity:
            raise HTTPException(status_code=404, detail=f"身份识别ID '{identity_id}' 不存在")
        
        mappings = db.query(PartnerEmailMapping).filter(
            PartnerEmailMapping.identity_id == identity_id
        ).all()
        
        return mappings
