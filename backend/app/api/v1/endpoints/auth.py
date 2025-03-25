from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any, Dict

from app.core.jwt import create_access_token, ALGORITHM, SECRET_KEY
from app.core.security import verify_password
from app.db.database import get_db
from app.schemas import schemas
from app.models.user_models import User
from app.models.partner_models import Partner

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Dict[str, Any]:
    """
    Admin login using OAuth2 password flow.
    """
    # Try to authenticate as admin user
    user = db.query(User).filter(User.username == form_data.username).first()
    if user and verify_password(form_data.password, user.hashed_password):
        scopes = ["admin"]
        if user.role == "sales_rep":
            scopes.append("sales_rep")
        elif user.role == "engineer":
            scopes.append("engineer")
        
        access_token_expires = timedelta(minutes=60 * 24 * 7)  # 7 days
        return {
            "access_token": create_access_token(
                data={
                    "sub": user.username,
                    "user_id": user.id,
                    "scopes": scopes
                },
                expires_delta=access_token_expires
            ),
            "token_type": "bearer"
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/partner-login", response_model=schemas.PartnerLoginResponse)
def partner_login(
    partner_login: schemas.PartnerLogin,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Partner login endpoint.
    """
    partner = db.query(Partner).filter(Partner.username == partner_login.Username).first()
    
    if not partner or not verify_password(partner_login.Password, partner.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    if partner.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Partner account is not active",
        )
    
    access_token_expires = timedelta(minutes=60 * 24 * 7)  # 7 days
    
    # Create access token with partner info
    access_token = create_access_token(
        data={
            "sub": partner.username,
            "partner_id": partner.partner_id,
            "scopes": ["partner"]
        },
        expires_delta=access_token_expires
    )
    
    # Convert partner to schema
    from app.services.partner_service import PartnerService
    partner_info = PartnerService._partner_to_schema(partner)
    
    return {
        "AccessToken": access_token,
        "TokenType": "bearer",
        "Partner": partner_info
    }


@router.post("/register-admin", response_model=schemas.UserInfo)
def create_admin_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Create a new admin user.
    This should be protected or disabled in production.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user_data.Username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    # Create new user with hashed password
    from app.core.security import get_password_hash
    
    new_user = User(
        username=user_data.Username,
        email=user_data.Email,
        hashed_password=get_password_hash(user_data.Password),
        full_name=user_data.FullName,
        is_active=user_data.IsActive,
        role=user_data.Role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return schemas.UserInfo(
        UserID=new_user.id,
        Username=new_user.username,
        Email=new_user.email,
        FullName=new_user.full_name,
        IsActive=new_user.is_active,
        Role=new_user.role,
        CreatedAt=new_user.created_at
    )
