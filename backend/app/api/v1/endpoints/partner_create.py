from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.partner_models import Partner
from app.core.security import get_password_hash
from app.schemas.schemas import PartnerInfo

router = APIRouter()

@router.post("/create-test-partner", response_model=PartnerInfo)
def create_test_partner(db: Session = Depends(get_db)):
    """
    创建测试合作伙伴账号，仅用于开发和测试环境
    """
    # 检查是否已经存在此用户名的合作伙伴
    existing_partner = db.query(Partner).filter(Partner.username == "partner1").first()
    if existing_partner:
        # 如果已存在，返回现有合作伙伴信息
        return {
            "PartnerID": existing_partner.partner_id,
            "PartnerName": existing_partner.partner_name,
            "ContactPerson": existing_partner.contact_person,
            "ContactEmail": existing_partner.contact_email,
            "ContactPhone": existing_partner.contact_phone,
            "Address": existing_partner.address,
            "PartnerLevel": existing_partner.partner_level,
            "Region": existing_partner.region,
            "Status": existing_partner.status,
            "Username": existing_partner.username,
            "CreatedAt": existing_partner.created_at,
            "UpdatedAt": existing_partner.updated_at,
        }

    # 创建新的测试合作伙伴
    password_hash = get_password_hash("partner123")
    new_partner = Partner(
        partner_name="测试合作伙伴",
        contact_person="联系人",
        contact_email="partner1@example.com",
        contact_phone="13800138000",
        address="北京市海淀区",
        partner_level="Premium",
        region="华北",
        status="ACTIVE",
        username="partner1",
        password_hash=password_hash
    )
    
    db.add(new_partner)
    db.commit()
    db.refresh(new_partner)
    
    return {
        "PartnerID": new_partner.partner_id,
        "PartnerName": new_partner.partner_name,
        "ContactPerson": new_partner.contact_person,
        "ContactEmail": new_partner.contact_email,
        "ContactPhone": new_partner.contact_phone,
        "Address": new_partner.address,
        "PartnerLevel": new_partner.partner_level,
        "Region": new_partner.region,
        "Status": new_partner.status,
        "Username": new_partner.username,
        "CreatedAt": new_partner.created_at,
        "UpdatedAt": new_partner.updated_at,
    }
