from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from pydantic import ValidationError
from typing import Dict, Optional, Union, List

from app.db.database import get_db
from app.models.partner_models import Partner
from app.models.user_models import User
from app.core.jwt import ALGORITHM, SECRET_KEY
from app.schemas.schemas import TokenData

# OAuth2 scheme for token-based authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    scopes={
        "admin": "Full access to all resources",
        "sales_rep": "Sales representative access",
        "engineer": "Engineer access",
        "partner": "Partner-specific access"
    }
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get the current user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
        user_id = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
            
    except (JWTError, ValidationError):
        raise credentials_exception
    
    # Find the user in the database
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None or user.username != username:
        raise credentials_exception
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Check if user is active"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Check if the current user has admin privileges"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


async def get_current_field_staff(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Check if the current user has field staff privileges (admin, sales_rep, or engineer)"""
    # 根据记忆，我们放宽了销售代表和工程师的访问限制
    if current_user.role not in ["admin", "sales_rep", "engineer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Field staff privileges required",
        )
    return current_user


async def get_current_sales_rep(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Check if the current user has sales rep privileges"""
    # admin也可以访问销售代表能访问的资源
    if current_user.role not in ["admin", "sales_rep"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sales rep privileges required",
        )
    return current_user


async def get_current_engineer(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Check if the current user has engineer privileges"""
    # admin也可以访问工程师能访问的资源
    if current_user.role not in ["admin", "engineer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Engineer privileges required",
        )
    return current_user


async def get_current_partner(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Partner:
    """Get the current partner from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
        # 检查是否是合作伙伴令牌
        scopes = payload.get("scopes", [])
        if "partner" not in scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Partner access required",
            )
            
        partner_id = payload.get("partner_id")
        if not partner_id:
            raise credentials_exception
            
    except (JWTError, ValidationError):
        raise credentials_exception
    
    # 从数据库中获取合作伙伴
    partner = db.query(Partner).filter(Partner.partner_id == partner_id).first()
    
    if not partner or partner.username != username:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found",
        )
        
    if partner.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Partner account is not active",
        )
        
    return partner
