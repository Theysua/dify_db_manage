# License Management System

A comprehensive system to manage licenses, customers, sales representatives, resellers, purchases, deployments, and support engineers.

## Project Overview

The License Management System (LMS) is designed to provide a structured approach to managing software licenses throughout their lifecycle. The system focuses on the License ID as the core element, ensuring clear hierarchy, precise role-based access control, and standardized business processes.

## Features

- **License Management**: Create, update, view, and delete licenses with complete tracking of changes.
- **Customer Management**: Maintain customer information and their associated licenses.
- **Sales Representatives**: Manage sales representatives and track their performance.
- **Resellers**: Track partner resellers and their associated licenses.
- **Purchase Records**: Record all transactions related to licenses, including new purchases, renewals, and expansions.
- **Deployment Records**: Monitor the deployment process of licenses, including engineer assignments.
- **Engineer Management**: Manage factory engineers responsible for deployments.
- **Performance Tracking**: Track sales and deployment metrics with detailed statistics.

## Technology Stack

- **Backend**: FastAPI, Python 3.8+
- **Frontend**: React 18, Ant Design 5
- **Database**: MySQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger UI / OpenAPI
- **Development Tools**: Alembic (migrations), Node.js

## Project Structure

```
dify_sales_db/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── licenses.py
│   │   │       │   ├── customers.py
│   │   │       │   ├── sales_reps.py
│   │   │       │   ├── resellers.py
│   │   │       │   ├── purchases.py
│   │   │       │   ├── deployments.py
│   │   │       │   └── engineers.py
│   │   │       └── api.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── db/
│   │   │   └── database.py
│   │   ├── models/
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

The frontend follows a modular structure:
- `layouts`: Page layouts and navigation components
- `pages`: Main page components organized by domain entity
- `components`: Reusable UI components
- `services`: API service integrations
- `utils`: Utility functions for error handling, formatting, etc.

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
