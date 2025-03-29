# Dify Sales Database Management System (DSMS)

![Dify Sales Management System](https://path.to/logo.png)

A comprehensive enterprise license lifecycle management platform designed for Dify enterprise products.

> **Latest Update (2025-03-25)**: Fixed partner order management functionality. Enhanced data access permissions for sales representatives and engineers. Resolved response validation errors in partner API endpoints.

## System Overview

Dify Sales Database Management System is a license management system designed for enterprise customers. It builds a complete license lifecycle tracking and management process with "License ID" as the core business entity. The system ensures a clear hierarchical relationship between customers and licenses, precise role-based access control, and standardized business processes.

## Key Features

### License Lifecycle Management

The system fully tracks the following states of licenses:

1. **Creation** - Records the creation and order date of the license
2. **Deployment** - Tracks the deployment status and completion of the license
3. **In Use** - Monitors actual workspaces and users, with alerts for overuse
4. **Renewal/Upgrade** - Records all purchase, renewal, and upgrade transactions
5. **Changes** - Complete change history tracking
6. **Expiration** - Monitors licenses that are about to expire or have expired

### Core Function Modules

- **License Management**: Create, update, view licenses with complete change tracking
- **Customer Management**: Maintain customer information and their associated licenses
- **Sales Representative Management**: Manage sales representatives and track their performance
- **Partner Management**: Track partners and their related orders
- **Reseller Management**: Manage resellers and their related licenses
- **Purchase Records**: Record all transactions related to licenses, including new purchases, renewals, and expansions
- **Deployment Records**: Monitor the deployment process of licenses, including engineer assignments
- **Engineer Management**: Manage factory engineers responsible for deployments
- **Performance Tracking**: Track sales and deployment metrics with detailed statistics
- **Alert System**: Automatic alerts for licenses that are about to expire or are being overused

### Enhanced Access Control

- **Sales Representatives**: Can view all customer information, licenses, deployment records, and engineer information
- **Engineers**: Can view all deployment records, sales representative information, customers, and licenses
- **Partners**: Can view their own orders and manage order details through a dedicated interface

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **Database**: MySQL
- **ORM**: SQLAlchemy
- **API Documentation**: Swagger UI / OpenAPI
- **Migration Tool**: Alembic
- **Authentication**: JWT (JSON Web Tokens)

### Frontend
- **Framework**: React 18
- **UI Library**: Ant Design 5
- **State Management**: React Hooks
- **Routing**: React Router
- **HTTP Client**: Axios
- **Build Tool**: Webpack
- **Package Manager**: npm/yarn

### Development & Deployment
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Container Orchestration**: Docker Compose
- **Code Quality**: ESLint, Prettier
- **Testing Tools**: Jest, React Testing Library

## System Architecture

The system adopts a frontend-backend separated architecture, communicating through RESTful APIs.

```
+----------------+     +----------------+     +----------------+
|                |     |                |     |                |
|  Frontend App  |<--->|  Backend API  |<--->|   Database     |
|  React + Antd  |     |    FastAPI    |     |     MySQL      |
|                |     |                |     |                |
+----------------+     +----------------+     +----------------+
```

### Data Model Relationships

Below are the core data models and their relationships in the system:

```
+-------------+     +-------------+     +-------------+
|             |     |             |     |             |
|  Customer   |<--->|   License   |<--->|  SalesRep   |
|             |     |             |     |             |
+-------------+     +------+------+     +-------------+
                           |
                           |
           +--------------------------+
           |              |           |
+----------v----+  +------v------+  +-v------------+
|               |  |             |  |              |
|PurchaseRecord |  |DeployRecord |  |  ChangeLog   |
|               |  |             |  |              |
+---------------+  +-------------+  +--------------+
```

```
+-------------+     +-------------+
|             |     |             |
|   Partner   |---->|    Order    |
|             |     |             |
+-------------+     +------+------+
                           |
                           |
                    +------v------+
                    |             |
                    |  OrderItem  |
                    |             |
                    +-------------+
```

```
+----------+     +-----------+     +--------+     +---------+     +--------+
|          |     |           |     |        |     |         |     |        |
| Created  |---->| Deployed  |---->| In Use |---->| Renewed |---->| Expired |
|          |     |           |     |        |     |         |     |        |
+----------+     +-----------+     +--------+     +---------+     +--------+
```

## Installation Guide

### Prerequisites

- Python 3.8+
- MySQL 5.7+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Theysua/dify_db_manage.git
   cd dify_db_manage
   ```

2. Create and activate a virtual environment
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables
   ```bash
   cp .env.example .env  # Then edit .env with your database credentials
   ```

5. Initialize the database
   ```bash
   alembic upgrade head
   ```

6. Create test data (optional)
   ```bash
   python -m app.db.create_mock_data
   ```

7. Start the backend server
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure the API URL
   ```bash
   cp .env.example .env  # Then edit .env with your API URL
   ```

4. Start the development server
   ```bash
   npm start
   # or
   yarn start
   ```

5. Access the application at http://localhost:3000

## API Reference

### Authentication

#### Admin Authentication
- `POST /api/v1/auth/login`: Admin login
- `GET /api/v1/auth/me`: Get current admin information

#### Partner Authentication
- `POST /api/v1/partners/login`: Partner login
- `GET /api/v1/partners/me`: Get current partner information
- `PUT /api/v1/partners/me`: Update current partner information

### Customer Management

- `GET /api/v1/customers`: Get customer list
- `POST /api/v1/customers`: Create new customer (admin only)
- `GET /api/v1/customers/{customer_id}`: Get specific customer details
- `PUT /api/v1/customers/{customer_id}`: Update customer information (admin only)
- `DELETE /api/v1/customers/{customer_id}`: Delete customer (admin only)

### License Management

- `GET /api/v1/licenses`: Get license list
- `POST /api/v1/licenses`: Create new license (admin only)
- `GET /api/v1/licenses/{license_id}`: Get specific license details
- `PUT /api/v1/licenses/{license_id}`: Update license information (admin only)
- `DELETE /api/v1/licenses/{license_id}`: Delete license (admin only)

### Order Management

- `GET /api/v1/partners/orders`: Get partner's order list
- `POST /api/v1/partners/orders`: Create new order
- `GET /api/v1/partners/orders/{order_id}`: Get specific order details

### Additional Endpoints

- Sales Representatives: `/api/v1/sales_reps`
- Resellers: `/api/v1/resellers`
- Purchase Records: `/api/v1/purchases`
- Deployment Records: `/api/v1/deployments`
- Factory Engineers: `/api/v1/engineers`

Complete API documentation is available at http://localhost:8000/docs when running the backend server.

## Project Structure

```
dify_sales_db/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/        # API endpoints
│   │   │       │   ├── licenses.py   # License API
│   │   │       │   ├── customers.py  # Customer API
│   │   │       │   ├── sales_reps.py # Sales Rep API
│   │   │       │   ├── resellers.py  # Reseller API
│   │   │       │   ├── purchases.py  # Purchase Records API
│   │   │       │   ├── deployments.py# Deployment Records API
│   │   │       │   ├── stats.py      # Statistics API
│   │   │       │   └── engineers.py  # Engineer API
│   │   │       └── api.py            # API route registration
│   │   ├── core/                     # Core configuration
│   │   │   ├── config.py             # System config
│   │   │   └── security.py           # Security related
│   │   ├── db/                       # Database related
│   │   │   └── database.py           # Database connection
│   │   ├── models/                   # Data models
│   │   │   └── models.py
│   │   ├── schemas/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── license_service.py
│   │   │   ├── customer_service.py
│   │   │   ├── sales_rep_service.py
│   │   │   ├── reseller_service.py
│   │   │   ├── purchase_service.py
│   │   │   ├── deployment_service.py
│   │   │   └── engineer_service.py
│   │   └── main.py
│   ├── alembic/
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   └── layouts/
│   │   │       └── MainLayout.js
│   │   ├── pages/
│   │   │   ├── customers/
│   │   │   ├── deployments/
│   │   │   ├── engineers/
│   │   │   ├── licenses/
│   │   │   ├── Dashboard.js
│   │   │   └── NotFound.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   ├── connectionCheck.js
│   │   │   ├── errorHandler.js
│   │   │   └── formatters.js
│   │   ├── App.js
│   │   ├── config.js
│   │   └── index.js
│   ├── package.json
│   ├── README.md
│   └── setup.sh
└── README.md
```

## User Guide

### User Roles and Permissions

#### Admin
- Full control over the system
- Can create, update, and delete all resources
- Can manage users and their permissions
- Can view and manage all partner orders

#### Sales Representative
- Can view all customer information
- Can view all license information
- Can view all deployment records
- Can view engineer information
- Can create purchase records
- Can view partner information

#### Factory Engineer
- Can view all deployment records
- Can view sales representative information
- Can view customer and license information
- Can update deployment status
- Can view sales representative information

#### Partner
- Can create and view their own orders
- Can view their own profile
- Can update their contact information
- Can manage order items and check order status

### Common Workflows

#### License Management Workflow

1. Admin creates a customer record
2. Admin or sales rep creates a license for the customer
3. Admin assigns engineer for deployment
4. Engineer updates deployment status
5. Sales rep or admin records any changes or renewals

#### Order Management Workflow

1. Partner logs in to the system
2. Partner creates a new order with detailed order items
3. Partner can view their orders and check status
4. Partner can add comments to orders
5. Admin can view all partner orders
6. Admin processes the order and updates its status

## Development Guide

### Adding New Features

1. Define the requirements and data model
2. Add necessary models in the appropriate model file
3. Create schemas in the schemas directory
4. Implement business logic in the services directory
5. Create API endpoints in the endpoints directory
6. Update the frontend to use the new endpoints

### Testing

```bash
# Backend API testing
cd backend
python test_order_api.py

# Frontend testing (if configured)
cd frontend
npm test
```

## Known Issues and Limitations

- **分页功能问题**: 销售代表和工程师列表的分页功能存在问题，包括：
  - 切换页面时，数据可能不会正确加载
  - 总页数和总记录数显示可能不准确
  - 每页记录数量变更后可能出现不一致的情况
  - 当前进展: 已经做了初步修复尝试，但仍需要进一步解决

- **权限控制优化**: 虽然已经放宽了销售代表和工程师的访问权限，但可能需要更精细的权限控制机制

- **合作伙伴订单关联**: 当前系统中订单主要关联到客户(Customer)而非合作伙伴(Partner)，未来需要重新设计关联查询方式

- **多语言支持**: 系统界面已包含中文标签，但未完全国际化，需要完善多语言支持系统

## Troubleshooting

### API Error Responses

- **401 Unauthorized**: Authentication issue, check your credentials or token
- **403 Forbidden**: Insufficient permissions for the requested operation
- **404 Not Found**: The requested resource does not exist
- **422 Unprocessable Entity**: Invalid request parameters or payload

### Common Solutions

- **Login Issues**: Verify username and password; check if user account is active
- **Data Retrieval Problems**: Ensure the correct parameters are provided in API calls
- **Order Creation Issues**: Verify that the order data format is correct and all required fields are provided

## Conclusion

The Dify Sales Database Management System provides a comprehensive solution for managing the entire lifecycle of enterprise licenses. By centralizing license operations around the License ID, the system ensures clear tracking of all related information, including customers, sales representatives, partners, and deployments.

With its enhanced access control features, the system enables better collaboration between sales representatives, engineers, and partners, while maintaining appropriate security boundaries for sensitive operations. The RESTful API design allows for easy integration with other systems and potential for future expansions.

## Appendix

### Partner Management Module Details

#### Partner Registration and Management

The Partner Management module allows system administrators to register and manage partner organizations that resell or distribute Dify enterprise products. Key features include:

- Partner profile creation and management
- Status tracking (Active, Inactive, Pending, Suspended)
- Region-based partner categorization
- Partner-level classification

#### Order Creation and Management

Partners can create and manage orders through a dedicated interface:

- **Create Order**: Partners can create new orders with multiple line items
- **Order List**: View all orders with filtering by status
- **Order Details**: View complete details of each order
- **Order Status**: Track order progress (Draft, Confirmed, Canceled)

#### Implementation Details

- Partner authentication using JWT tokens
- Secure access control to partner-specific data
- Hierarchical relationship between partners and orders
- Comprehensive data validation for order submission

### Recent Feature Updates

#### 2025-03-25: Partner Order Button Fix

- Fixed an issue where the order button on the partner management page was not correctly navigating to the partner orders page
- Resolved attribute naming inconsistencies between frontend and backend
- Ensured proper integer type conversion for partner IDs in API requests
- Fixed response validation errors in partner API endpoints

#### 2025-03-18: Enhanced Access Control

- Relaxed access restrictions for sales representatives and engineers
- Added new dependency function `get_current_field_staff` to enhance permission handling
- Updated API endpoint permission controls


Dify Sales Database 系统优化建议
基于对系统当前状态的分析，我发现了以下不足之处并提出相应的优化策略：

一、美学方面
现有不足：
基于Ant Design的界面缺乏现代化视觉元素和差异化品牌体验
数据可视化（如漏斗图）样式较为基础，缺乏交互性
页面布局结构较为传统，空间利用效率不高
优化策略：
UI设计升级：
引入定制化主题，融入Dify品牌色彩和设计语言
添加微交互和动效提升用户体验
实现深色模式支持
数据可视化增强：
升级漏斗图、统计卡片等组件为更具交互性的图表
引入更多图表类型（如热力图、双轴图表）提升数据展示效果
添加图表下载和分享功能
布局优化：
重构卡片布局，增加信息密度的同时保持清晰度
引入可折叠/展开的内容区域，减少页面滚动
二、系统可用性
现有不足：
加载状态管理基础，使用简单的Spin组件
错误处理机制简单，仅显示错误信息
缺乏引导式用户体验
表单交互和用户反馈不够直观
优化策略：
加载体验优化：
引入骨架屏(Skeleton)替代单一Spin组件
实现内容预加载机制，减少感知等待时间
错误处理增强：
设计分级错误处理机制，区分网络、权限、数据错误
提供智能错误恢复建议和一键重试功能
用户引导系统：
实现功能引导tours，帮助新用户快速上手
添加情境化帮助信息和工具提示
表单交互优化：
实现实时表单验证和智能提示
增加表单自动保存和恢复功能
三、功能完善度
现有不足：
权限控制已有改进但仍缺乏细粒度控制
缺乏全面的数据导出和报表功能
没有明显的移动端支持
集成能力有限，缺乏与第三方系统的连接
优化策略：
权限管理升级：
实现基于角色、资源和操作的RBAC权限模型
添加权限组和临时权限分配功能
提供权限审计日志
报表与分析增强：
开发自定义报表生成器
增加高级筛选和透视表功能
支持多种导出格式(Excel, PDF, CSV)
移动端支持：
实现响应式设计，支持所有设备类型
开发轻量级移动应用或PWA
针对触屏优化关键操作流程
集成能力提升：
开发开放API接口，支持第三方系统集成
添加常用SaaS服务连接器(CRM, ERP等)
实现自动化工作流引擎
四、性能与可靠性
现有不足：
缺乏明显的性能优化策略
数据备份和恢复机制不清晰
缺乏系统健康监控
优化策略：
前端性能优化：
实现组件懒加载和代码分割
添加资源缓存策略
优化关键渲染路径
数据安全增强：
实现自动备份和恢复功能
添加数据加密和脱敏机制
增强审计日志功能
系统监控：
部署性能监控和警报系统
实现用户行为分析
添加系统健康仪表盘