from datetime import datetime, timedelta
from typing import Any, Optional

from jose import jwt

from app.core.config import settings

# 导出常量，供deps.py使用
ALGORITHM = "HS256"
SECRET_KEY = settings.SECRET_KEY

def create_access_token(
    data: dict, 
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    创建JWT访问令牌
    
    Args:
        data: 要编码到JWT中的数据
        expires_delta: 可选的过期时间增量
        
    Returns:
        str: 编码的JWT访问令牌
    """
    to_encode = data.copy()
    
    # 设置过期时间
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # 添加标准JWT声明
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access_token"
    })
    
    # 编码并返回JWT
    encoded_jwt = jwt.encode(
        to_encode, 
        SECRET_KEY, 
        algorithm=ALGORITHM
    )
    
    return encoded_jwt
