from fastapi import APIRouter

from app.api.v1.endpoints import licenses, customers, sales_reps, resellers, purchases, deployments, engineers, admin_partners, partners, auth, users, partner_create

api_router = APIRouter()

api_router.include_router(licenses.router, prefix="/licenses", tags=["licenses"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(sales_reps.router, prefix="/sales-reps", tags=["sales_reps"])
api_router.include_router(resellers.router, prefix="/resellers", tags=["resellers"])
api_router.include_router(purchases.router, prefix="/purchases", tags=["purchases"])
api_router.include_router(deployments.router, prefix="/deployments", tags=["deployments"])
api_router.include_router(engineers.router, prefix="/engineers", tags=["engineers"])
api_router.include_router(admin_partners.router, prefix="/admin", tags=["admin"])
api_router.include_router(partners.router, prefix="/partners", tags=["partners"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(partner_create.router, prefix="/setup", tags=["setup"])
