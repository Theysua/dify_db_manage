#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
许可证激活API
处理许可证在线/离线激活模式切换和激活码生成
"""

from typing import Any, Dict, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path
from sqlalchemy.orm import Session

from app.api import deps
from app.models.models import License
from app.models.user_models import User
from app.core.license_tools import (
    generate_online_license,
    generate_offline_license,
    verify_offline_license,
    log_activation_change
)
from app.schemas.license_schemas import (
    LicenseActivationRequest,
    LicenseActivationResponse,
    LicenseInfo,
    OfflineActivationRequest
)

router = APIRouter()

@router.get("/test")
def test_endpoint():
    """测试端点，无需认证"""
    return {"status": "ok", "message": "激活API测试端点正常工作"}

@router.get("/licenses/{license_id}/activation-info", response_model=LicenseInfo)
def get_license_activation_info(
    license_id: str = Path(..., description="许可证ID"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_field_staff)
):
    """
    获取许可证的激活信息
    
    权限：
    - 管理员：所有许可证
    - 销售代表：所有许可证（放宽权限）
    - 工程师：所有许可证（放宽权限）
    """
    license_obj = db.query(License).filter(License.license_id == license_id).first()
    if not license_obj:
        raise HTTPException(status_code=404, detail="许可证不存在")
    
    # 转换为响应模型
    activation_history = license_obj.activation_history or {}
    return {
        "license_id": license_obj.license_id,
        "activation_mode": license_obj.activation_mode,
        "cluster_id": license_obj.cluster_id,
        "offline_code": license_obj.offline_code,
        "last_activation_change": license_obj.last_activation_change,
        "activation_history": activation_history,
        "license_status": license_obj.license_status,
        "expiry_date": license_obj.expiry_date
    }

@router.post("/licenses/{license_id}/change-activation", response_model=LicenseActivationResponse)
def change_license_activation(
    license_activation: LicenseActivationRequest,
    license_id: str = Path(..., description="许可证ID"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    变更许可证激活模式（在线/离线）
    
    权限：
    - 管理员：可以更改所有许可证的激活模式
    - 销售代表：不可更改（需要管理员审批）
    - 工程师：不可更改（需要管理员审批）
    """
    # 检查当前用户权限
    if current_user.role != "admin" and current_user.role != "commercial_ops":
        raise HTTPException(
            status_code=403,
            detail="权限不足，变更激活模式需要管理员或商业运营权限"
        )
    
    # 获取许可证
    license_obj = db.query(License).filter(License.license_id == license_id).first()
    if not license_obj:
        raise HTTPException(status_code=404, detail="许可证不存在")
    
    # 检查是否为相同模式
    if license_obj.activation_mode == license_activation.activation_mode:
        return {
            "license_id": license_id,
            "activation_mode": license_obj.activation_mode,
            "message": f"许可证已经是{license_activation.activation_mode}激活模式，无需变更",
            "offline_code": license_obj.offline_code,
            "cluster_id": license_obj.cluster_id
        }
    
    # 激活模式变更逻辑
    # 从在线到离线
    if (license_obj.activation_mode == "ONLINE" and 
        license_activation.activation_mode == "OFFLINE"):
        
        # 验证集群ID
        if not license_activation.cluster_id:
            raise HTTPException(
                status_code=400,
                detail="离线激活需要提供有效的集群ID(cluster_id)"
            )
        
        # 获取许可证数据
        license_data = {
            "license_id": license_obj.license_id,
            "customer_id": license_obj.customer_id,
            "product_name": license_obj.product_name,
            "license_type": license_obj.license_type,
            "start_date": license_obj.start_date,
            "expiry_date": license_obj.expiry_date,
            "authorized_workspaces": license_obj.authorized_workspaces,
            "authorized_users": license_obj.authorized_users
        }
        
        # 生成离线激活码
        offline_code = generate_offline_license(
            license_data=license_data,
            cluster_id=license_activation.cluster_id
        )
        
        # 更新许可证记录
        license_obj.activation_mode = "OFFLINE"
        license_obj.cluster_id = license_activation.cluster_id
        license_obj.offline_code = offline_code
        
    # 从离线到在线
    elif (license_obj.activation_mode == "OFFLINE" and 
          license_activation.activation_mode == "ONLINE"):
        
        # 生成在线许可证密钥（模拟）
        license_data = {
            "license_id": license_obj.license_id,
            "customer_id": license_obj.customer_id,
            "product_name": license_obj.product_name,
            "license_type": license_obj.license_type
        }
        _ = generate_online_license(license_data)
        
        # 更新许可证记录
        license_obj.activation_mode = "ONLINE"
        license_obj.offline_code = None  # 使离线激活码失效
        # 保留cluster_id以便查看历史记录，但它不再有效
        
    # 记录激活方式变更历史
    activation_history = log_activation_change(
        license_data=license_obj.activation_history or {},
        from_mode=license_obj.activation_mode,
        to_mode=license_activation.activation_mode,
        cluster_id=license_activation.cluster_id if license_activation.activation_mode == "OFFLINE" else None
    )
    
    # 更新激活历史和变更时间
    license_obj.activation_history = activation_history
    license_obj.last_activation_change = datetime.now()
    license_obj.updated_at = datetime.now()
    
    db.commit()
    
    return {
        "license_id": license_id,
        "activation_mode": license_obj.activation_mode,
        "message": f"许可证激活模式已从{license_activation.from_mode}变更为{license_activation.activation_mode}",
        "offline_code": license_obj.offline_code,
        "cluster_id": license_obj.cluster_id
    }

@router.post("/licenses/{license_id}/regenerate-offline-code", response_model=LicenseActivationResponse)
def regenerate_offline_code(
    offline_request: OfflineActivationRequest,
    license_id: str = Path(..., description="许可证ID"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):
    """
    重新生成离线激活码（当Cluster ID改变时）
    
    权限：
    - 管理员：可以重新生成所有许可证的离线激活码
    - 销售代表：不可重新生成（需要管理员审批）
    - 工程师：不可重新生成（需要管理员审批）
    """
    # 检查当前用户权限
    if current_user.role != "admin" and current_user.role != "commercial_ops":
        raise HTTPException(
            status_code=403,
            detail="权限不足，重新生成激活码需要管理员或商业运营权限"
        )
    
    # 获取许可证
    license_obj = db.query(License).filter(License.license_id == license_id).first()
    if not license_obj:
        raise HTTPException(status_code=404, detail="许可证不存在")
    
    # 验证许可证是否为离线模式
    if license_obj.activation_mode != "OFFLINE":
        raise HTTPException(
            status_code=400,
            detail="只能为离线激活模式的许可证重新生成激活码"
        )
    
    # 验证集群ID
    if not offline_request.cluster_id:
        raise HTTPException(
            status_code=400,
            detail="需要提供有效的集群ID(cluster_id)"
        )
    
    # 准备许可证数据
    license_data = {
        "license_id": license_obj.license_id,
        "customer_id": license_obj.customer_id,
        "product_name": license_obj.product_name,
        "license_type": license_obj.license_type,
        "start_date": license_obj.start_date,
        "expiry_date": license_obj.expiry_date,
        "authorized_workspaces": license_obj.authorized_workspaces,
        "authorized_users": license_obj.authorized_users
    }
    
    # 保存旧集群ID
    old_cluster_id = license_obj.cluster_id
    
    # 生成新的离线激活码
    offline_code = generate_offline_license(
        license_data=license_data,
        cluster_id=offline_request.cluster_id
    )
    
    # 更新许可证记录
    license_obj.cluster_id = offline_request.cluster_id
    license_obj.offline_code = offline_code
    
    # 记录激活码重新生成历史
    activation_history = log_activation_change(
        license_data=license_obj.activation_history or {},
        from_mode="OFFLINE",
        to_mode="OFFLINE",
        cluster_id=offline_request.cluster_id
    )
    
    # 更新激活历史和变更时间
    license_obj.activation_history = activation_history
    license_obj.last_activation_change = datetime.now()
    license_obj.updated_at = datetime.now()
    
    db.commit()
    
    return {
        "license_id": license_id,
        "activation_mode": "OFFLINE",
        "message": f"离线激活码已重新生成，集群ID从{old_cluster_id}变更为{offline_request.cluster_id}",
        "offline_code": license_obj.offline_code,
        "cluster_id": license_obj.cluster_id
    }
