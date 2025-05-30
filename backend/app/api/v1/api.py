from fastapi import APIRouter

from app.api.v1.endpoints import licenses, customers, sales_reps, resellers, purchases, deployments, engineers, admin_partners, partners, auth, users, partner_create, admin_orders, leads, activation, orders, partner_identity

api_router = APIRouter()

api_router.include_router(licenses.router, prefix="/licenses", tags=["licenses"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(sales_reps.router, prefix="/sales-reps", tags=["sales_reps"])
api_router.include_router(resellers.router, prefix="/resellers", tags=["resellers"])
api_router.include_router(purchases.router, prefix="/purchases", tags=["purchases"])
api_router.include_router(deployments.router, prefix="/deployments", tags=["deployments"])
api_router.include_router(engineers.router, prefix="/engineers", tags=["engineers"])
api_router.include_router(admin_partners.router, prefix="/admin", tags=["admin"])
api_router.include_router(admin_orders.router, prefix="/admin/orders", tags=["admin-orders"])
api_router.include_router(partners.router, prefix="/partners", tags=["partners"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(partner_create.router, prefix="/setup", tags=["setup"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
# 注册许可证激活API路由 - 与前端调用路径保持一致
api_router.include_router(activation.router, prefix="/activation", tags=["license-activation"])

# 注册订单处理API路由
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])

# 注册合作商身份识别与邮箱映射API路由
api_router.include_router(partner_identity.router, prefix="/partner-identity", tags=["partner-identity"])
