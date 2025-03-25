# Dify Sales Database Management System (DSMS)

![Dify Sales Management System](https://path.to/logo.png)

A comprehensive enterprise license lifecycle management platform designed for Dify enterprise products.

> **Latest Update (2025-03-25)**: Fixed order API issues, allowing partners to view all order information. Enhanced data access permissions for sales representatives and engineers.

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

- **Sales Representatives**: Now can view all customer information, licenses, deployment records, and engineer information
- **Engineers**: Now can view all deployment records, sales representative information, customers, and licenses
- **Partners**: Now can view all order details (not limited to orders they created)

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

#### Sales Representative
- Can view all customer information
- Can view all license information
- Can view all deployment records
- Can view engineer information
- Can create purchase records

#### Factory Engineer
- Can view all deployment records
- Can view sales representative information
- Can view customer and license information
- Can update deployment status

#### Partner
- Can create and view orders
- Can view their own profile
- Can update their contact information

### Common Workflows

#### License Management Workflow

1. Admin creates a customer record
2. Admin or sales rep creates a license for the customer
3. Admin assigns engineer for deployment
4. Engineer updates deployment status
5. Sales rep or admin records any changes or renewals

#### Order Management Workflow

1. Partner logs in to the system
2. Partner creates a new order with details
3. Partner can view all orders and their status
4. Admin or authorized staff processes the order

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
