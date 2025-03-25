from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from fastapi import HTTPException

from app.models.lead_models import Lead, LeadSource, LeadStatus, LeadActivity
from app.schemas import lead_schemas


# LeadSource CRUD
def create_lead_source(db: Session, source: lead_schemas.LeadSourceCreate) -> LeadSource:
    db_source = LeadSource(**source.dict())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source


def get_lead_source(db: Session, source_id: int) -> LeadSource:
    db_source = db.query(LeadSource).filter(LeadSource.source_id == source_id).first()
    if db_source is None:
        raise HTTPException(status_code=404, detail="Lead source not found")
    return db_source


def get_lead_sources(db: Session, skip: int = 0, limit: int = 100) -> List[LeadSource]:
    return db.query(LeadSource).offset(skip).limit(limit).all()


def update_lead_source(db: Session, source_id: int, source: lead_schemas.LeadSourceUpdate) -> LeadSource:
    db_source = get_lead_source(db, source_id)
    update_data = source.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_source, field, value)
    db.commit()
    db.refresh(db_source)
    return db_source


# LeadStatus CRUD
def create_lead_status(db: Session, status: lead_schemas.LeadStatusCreate) -> LeadStatus:
    db_status = LeadStatus(**status.dict())
    db.add(db_status)
    db.commit()
    db.refresh(db_status)
    return db_status


def get_lead_status(db: Session, status_id: int) -> LeadStatus:
    db_status = db.query(LeadStatus).filter(LeadStatus.status_id == status_id).first()
    if db_status is None:
        raise HTTPException(status_code=404, detail="Lead status not found")
    return db_status


def get_lead_statuses(db: Session, skip: int = 0, limit: int = 100) -> List[LeadStatus]:
    return db.query(LeadStatus).order_by(asc(LeadStatus.display_order)).offset(skip).limit(limit).all()


def update_lead_status(db: Session, status_id: int, status: lead_schemas.LeadStatusUpdate) -> LeadStatus:
    db_status = get_lead_status(db, status_id)
    update_data = status.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_status, field, value)
    db.commit()
    db.refresh(db_status)
    return db_status


# Lead CRUD
def create_lead(db: Session, lead: lead_schemas.LeadCreate) -> Lead:
    db_lead = Lead(**lead.dict())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def get_lead(db: Session, lead_id: int) -> Lead:
    db_lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if db_lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return db_lead


def get_leads(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    status_id: Optional[int] = None,
    sales_rep_id: Optional[int] = None,
    partner_id: Optional[int] = None,
    source_id: Optional[int] = None,
    search_term: Optional[str] = None
) -> List[Lead]:
    query = db.query(Lead)
    
    if status_id:
        query = query.filter(Lead.status_id == status_id)
    
    if sales_rep_id:
        query = query.filter(Lead.sales_rep_id == sales_rep_id)
    
    if partner_id:
        query = query.filter(Lead.partner_id == partner_id)
    
    if source_id:
        query = query.filter(Lead.source_id == source_id)
    
    if search_term:
        search_pattern = f"%{search_term}%"
        query = query.filter(
            (Lead.lead_name.ilike(search_pattern)) |
            (Lead.company_name.ilike(search_pattern)) |
            (Lead.contact_person.ilike(search_pattern)) |
            (Lead.contact_email.ilike(search_pattern))
        )
    
    return query.order_by(desc(Lead.updated_at)).offset(skip).limit(limit).all()


def update_lead(db: Session, lead_id: int, lead: lead_schemas.LeadUpdate) -> Lead:
    db_lead = get_lead(db, lead_id)
    update_data = lead.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_lead, field, value)
    db.commit()
    db.refresh(db_lead)
    return db_lead


def update_lead_status_only(db: Session, lead_id: int, status_update: lead_schemas.LeadStatusUpdate) -> Lead:
    db_lead = get_lead(db, lead_id)
    db_lead.status_id = status_update.status_id
    
    if status_update.notes:
        db_lead.notes = status_update.notes if not db_lead.notes else f"{db_lead.notes}\n\n{status_update.notes}"
    
    db.commit()
    db.refresh(db_lead)
    return db_lead


def delete_lead(db: Session, lead_id: int) -> Dict[str, bool]:
    db_lead = get_lead(db, lead_id)
    db.delete(db_lead)
    db.commit()
    return {"success": True}


# LeadActivity CRUD
def create_lead_activity(db: Session, activity: lead_schemas.LeadActivityCreate) -> LeadActivity:
    db_activity = LeadActivity(**activity.dict())
    
    # Update lead's last_activity_date
    db_lead = get_lead(db, activity.lead_id)
    db_lead.last_activity_date = activity.activity_date
    
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


def get_lead_activities(db: Session, lead_id: int, skip: int = 0, limit: int = 100) -> List[LeadActivity]:
    return db.query(LeadActivity).filter(
        LeadActivity.lead_id == lead_id
    ).order_by(desc(LeadActivity.activity_date)).offset(skip).limit(limit).all()


def update_lead_activity(db: Session, activity_id: int, activity: lead_schemas.LeadActivityUpdate) -> LeadActivity:
    db_activity = db.query(LeadActivity).filter(LeadActivity.activity_id == activity_id).first()
    if db_activity is None:
        raise HTTPException(status_code=404, detail="Lead activity not found")
    
    update_data = activity.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_activity, field, value)
    
    db.commit()
    db.refresh(db_activity)
    return db_activity


def delete_lead_activity(db: Session, activity_id: int) -> Dict[str, bool]:
    db_activity = db.query(LeadActivity).filter(LeadActivity.activity_id == activity_id).first()
    if db_activity is None:
        raise HTTPException(status_code=404, detail="Lead activity not found")
    
    db.delete(db_activity)
    db.commit()
    return {"success": True}


# Analytics Functions
def get_lead_counts_by_status(db: Session) -> List[Dict[str, Any]]:
    results = db.query(
        LeadStatus.status_id,
        LeadStatus.status_name,
        func.count(Lead.lead_id).label('count'),
        func.coalesce(func.sum(Lead.estimated_value), 0).label('total_value')
    ).outerjoin(
        Lead, LeadStatus.status_id == Lead.status_id
    ).group_by(
        LeadStatus.status_id, LeadStatus.status_name
    ).order_by(
        LeadStatus.display_order
    ).all()
    
    return [
        lead_schemas.LeadCountByStatus(
            status_id=r.status_id,
            status_name=r.status_name,
            count=r.count,
            total_value=float(r.total_value)
        ) for r in results
    ]


def get_lead_funnel_data(db: Session) -> lead_schemas.LeadFunnelData:
    stages = get_lead_counts_by_status(db)
    total_leads = sum(stage.count for stage in stages)
    total_value = sum(stage.total_value for stage in stages)
    
    return lead_schemas.LeadFunnelData(
        stages=stages,
        total_leads=total_leads,
        total_value=total_value
    )
