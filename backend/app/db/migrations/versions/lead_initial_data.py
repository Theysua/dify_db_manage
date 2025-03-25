"""Add initial data for lead sources and statuses

Revision ID: lead_initial_data
Revises: 
Create Date: 2025-03-26

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'lead_initial_data'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # 创建初始商机来源数据
    lead_sources = table('lead_sources',
        column('source_id', sa.Integer),
        column('source_name', sa.String),
        column('description', sa.String),
        column('is_active', sa.Boolean),
        column('created_at', sa.DateTime),
        column('updated_at', sa.DateTime)
    )
    
    current_time = datetime.now()
    
    op.bulk_insert(lead_sources, [
        {'source_id': 1, 'source_name': '官网咨询', 'description': '通过官方网站咨询表单提交的潜在客户', 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
        {'source_id': 2, 'source_name': '销售开发', 'description': '销售团队主动开发的潜在客户', 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
        {'source_id': 3, 'source_name': '合作伙伴推荐', 'description': '由合作伙伴推荐的潜在客户', 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
        {'source_id': 4, 'source_name': '行业活动', 'description': '通过展会、研讨会等行业活动获取的潜在客户', 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
        {'source_id': 5, 'source_name': '老客户推荐', 'description': '由现有客户推荐的潜在客户', 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
        {'source_id': 6, 'source_name': '社交媒体', 'description': '通过社交媒体平台获取的潜在客户', 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
    ])
    
    # 创建初始商机状态数据
    lead_statuses = table('lead_statuses',
        column('status_id', sa.Integer),
        column('status_name', sa.String),
        column('description', sa.String),
        column('display_order', sa.Integer),
        column('is_active', sa.Boolean),
        column('created_at', sa.DateTime),
        column('updated_at', sa.DateTime)
    )
    
    op.bulk_insert(lead_statuses, [
        {'status_id': 1, 'status_name': '新线索', 'description': '新获取的潜在客户，尚未进行接触', 'display_order': 1, 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
        {'status_id': 2, 'status_name': '洽谈中', 'description': '已经与客户建立联系并进行初步洽谈', 'display_order': 2, 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
        {'status_id': 3, 'status_name': '已提交方案', 'description': '已向客户提交解决方案或报价', 'display_order': 3, 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
        {'status_id': 4, 'status_name': '已赢单', 'description': '客户已经接受方案，商机转化为订单', 'display_order': 4, 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
        {'status_id': 5, 'status_name': '已输单', 'description': '客户拒绝方案，商机失败', 'display_order': 5, 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
        {'status_id': 6, 'status_name': '已取消', 'description': '由于各种原因取消的商机', 'display_order': 6, 'is_active': True, 'created_at': current_time, 'updated_at': current_time},
    ])


def downgrade():
    # 删除初始数据
    op.execute("DELETE FROM lead_sources WHERE source_id BETWEEN 1 AND 6")
    op.execute("DELETE FROM lead_statuses WHERE status_id BETWEEN 1 AND 6")
