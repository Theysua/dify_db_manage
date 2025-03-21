# Dify Enterprise License Management System

![Dify Enterprise](https://path.to/logo.png)

A comprehensive license lifecycle management platform for Dify Enterprise products.

## Project Overview

Dify Enterprise License Management System (DELMS) is a license management system designed for enterprise customers. It builds a complete license lifecycle tracking and management process with "License ID" as the core business entity. The system ensures a clear hierarchical relationship between customers and licenses, precise role-based access control, and standardized business processes.

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
- **Reseller Management**: Track partners and their associated licenses
- **Purchase Records**: Record all transactions related to licenses, including new purchases, renewals, and expansions
- **Deployment Records**: Monitor the deployment process of licenses, including engineer assignments
- **Engineer Management**: Manage factory engineers responsible for deployments
- **Performance Tracking**: Track sales and deployment metrics with detailed statistics
- **Alert System**: Automatic alerts for licenses that are about to expire or are being overused

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

### License Lifecycle Flow

```
+----------+     +-----------+     +--------+     +---------+     +--------+
|          |     |           |     |        |     |         |     |        |
| Created  |---->| Deployed  |---->| In Use |---->| Renewed |---->| Expired |
|          |     |           |     |        |     |         |     |        |
+----------+     +-----------+     +--------+     +---------+     +--------+
```

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

## License Management Features

### License Creation and Automated ID Generation

The system generates unique license IDs based on a predefined format to ensure easy tracking and identification. The license ID format incorporates elements such as product type, creation date, and unique identifiers:

```
Format: XXX-YYYYMM-NNNNNN

Where:
- XXX: Product type (ENT for Enterprise, PRO for Professional, etc.)
- YYYYMM: Year and month of creation
- NNNNNN: Unique identifier
```

Example: `ENT-202503-123456`

### License Lifecycle Visualization

A comprehensive timeline view for each license shows its complete history:

- Initial creation and order date
- Deployment status and date
- Current usage metrics (workspaces/users)
- Purchase history, including renewals and upgrades
- License expiration date

### Usage Monitoring and Alerts

The system continuously monitors license usage and provides alerts for:

- Licenses approaching expiration (30, 60, 90 days)
- Licenses with workspace/user counts exceeding authorized limits
- Inactive licenses (no usage recorded)
- Irregular usage patterns

### Role-Based Access Control

The system implements a precise role-based access control mechanism:

- **Sales Representatives**: Manage customer and license information, create new licenses
- **Deployment Engineers**: Handle deployment and configuration of licensed systems
- **Channel Partners**: View and manage licenses associated with their customers
- **System Administrators**: Full access to all system functions

## Getting Started

### Prerequisites

- Python 3.8+
- MySQL 5.7+ or MariaDB

### Installation

#### Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dify_sales_db
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Configure the database:
   ```bash
   # Create MySQL database
   mysql -u root -p
   > CREATE DATABASE dify_sales;
   > EXIT;
   ```

5. Update environment variables (if needed):
   - Create a `.env` file in the backend directory
   - Add any configuration overrides (database credentials, etc.)

6. Start the backend server:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

7. Access the API documentation at `http://localhost:8000/api/v1/docs`

#### Frontend Setup

1. Make sure Node.js (v16+) is installed:
   ```bash
   node -v
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Access the frontend application at `http://localhost:3000`

Alternatively, you can use the setup script:
```bash
cd frontend
chmod +x setup.sh  # Make executable if needed
./setup.sh
npm start
```

## API Documentation

The API documentation is automatically generated using Swagger UI. You can access it at `/api/v1/docs` when the application is running.

### Key Endpoints

- `/api/v1/licenses`: Manage licenses
- `/api/v1/customers`: Manage customers
- `/api/v1/sales-reps`: Manage sales representatives
- `/api/v1/resellers`: Manage resellers
- `/api/v1/purchases`: Manage purchase records
- `/api/v1/deployments`: Manage deployment records
- `/api/v1/engineers`: Manage factory engineers

## License Management Process

The system supports the complete lifecycle of a license:

1. **Creation**: Sales reps create new license records
2. **Purchase**: Initial purchase record is created
3. **Deployment**: System is deployed for the customer
4. **Monitoring**: Usage and status are tracked
5. **Renewal/Expansion**: Additional purchase records update the license
6. **Expiration/Termination**: License status is updated accordingly

## Development

### Backend Development

#### Database Migrations

The project uses Alembic for database migrations:

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head
```

#### Running Backend Tests

```bash
pytest
```

### Frontend Development

#### Component Structure

The frontend uses a component-based architecture with the following key components:

- **Layout Components**: Page structure and navigation
- **Form Components**: Reusable form elements for data entry
- **Table Components**: Data display with sorting and filtering
- **Chart Components**: Visualizations for performance metrics
- **Modal Components**: Dialog boxes for confirmation and detailed views

The frontend follows a modular file structure:
- `layouts`: Page layouts and navigation components
- `pages`: Main page components organized by domain entity
- `components`: Reusable UI components
- `services`: API service clients
- `utils`: Utility functions and helpers

## Key Screens

### License Management Dashboard

The central dashboard provides an overview of all licenses with important metrics:

- Total active/inactive licenses
- Licenses by status (active, expired, etc.)
- Licenses about to expire in the next 30/60/90 days
- License distribution by product type
- Usage metrics across customers

### License Detail View

The license detail view provides comprehensive information about a specific license:

- License identifiers and associated customer information
- Lifecycle timeline showing all key events
- Usage metrics with visual indicators for overuse
- Purchase and renewal history
- Deployment records and status
- Change history log

### Operations Center

The operations center allows sales representatives to create and manage licenses:

- License creation with automated ID generation
- Customer association and information management
- Product and license type selection
- Initial authorization limits
- Deployment scheduling

## Conclusion

The Dify Enterprise License Management System provides a comprehensive solution for managing the entire lifecycle of software licenses. By centralizing license operations around the License ID, the system ensures clear tracking of all related information including customers, sales, procurement, channel partners, and deployments.

The system's focus on precise license lifecycle management - from creation through deployment, usage, renewal, and expiration - provides stakeholders with complete visibility into license status and usage patterns, enabling better decision-making and customer service.

## Contact

For questions or support, please contact:

- Email: support@example.com
- Website: https://example.com

## Version History

- **v1.0.0** - Initial release
- **v1.1.0** - Added license lifecycle tracking
- **v1.2.0** - Enhanced usage monitoring


#### Adding New Features

1. Create new API service methods in `src/services/api.js`
2. Add new pages or components as needed
3. Update the navigation in `MainLayout.js` if adding major sections

#### Building for Production

```bash
cd frontend
npm run build
```

The build files will be generated in the `build` directory and can be served using a static file server.

## License

[MIT License](LICENSE)
