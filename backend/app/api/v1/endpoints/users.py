from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.core.jwt import create_access_token
from app.db.database import get_db
from app.models.user_models import User
from app.schemas import schemas
from app.api import deps

router = APIRouter()


@router.get("/me", response_model=schemas.UserInfo)
def get_current_user(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user information.
    """
    return current_user


@router.get("/{user_id}", response_model=schemas.UserInfo)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Get a specific user by id. Admin only.
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user
