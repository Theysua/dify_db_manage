# Partner Order System Design for Dify.AI Enterprise Licenses

## System Overview
The Partner Order System allows authorized partners to place orders for Dify.AI Enterprise licenses. Partners can log in, acknowledge agreement terms, and submit license orders that will be processed by the company.

```
┌─────────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   Partner Portal    │     │  Order Management │     │ License Management │
│                     │────▶│      System       │────▶│      System       │
│  - Authentication   │     │  - Order Creation │     │ - License Creation │
│  - Order Submission │     │  - Order Tracking │     │ - License Tracking │
└─────────────────────┘     └───────────────────┘     └───────────────────┘
```

## Database Schema Extensions

### 1. Partner Account Table
```
partners
  - partner_id (PK)
  - partner_name
  - contact_person
  - contact_email
  - contact_phone
  - address
  - partner_level
  - region
  - status (ACTIVE/INACTIVE)
  - username
  - password_hash
  - created_at
  - updated_at
```

### 2. Order Table
```
orders
  - order_id (PK)
  - partner_id (FK)
  - order_number
  - order_date
  - agreement_acknowledged (Boolean)
  - agreement_date
  - total_amount
  - status (PENDING, APPROVED, REJECTED, COMPLETED)
  - notes
  - created_at
  - updated_at
```

### 3. Order Items Table
```
order_items
  - item_id (PK)
  - order_id (FK)
  - product_name
  - license_type
  - quantity
  - unit_price
  - total_price
  - license_duration_years
  - tax_rate
  - end_user_name
  - created_at
  - updated_at
```

## User Flow

1. **Authentication**
   - Partner logs in with credentials
   - System validates partner status

2. **Order Form**
   - Partner fills out order form
   - Partner acknowledges agreement terms
   - System calculates totals (price, tax)

3. **Order Submission**
   - Partner reviews and submits order
   - System creates order record
   - System notifies administrators

4. **Order Processing**
   - Admin reviews and approves order
   - System generates license(s)
   - System updates order status

## Component Design

### Frontend Components
1. **Partner Login Page**
   - Username/password authentication
   - Password recovery

2. **Order Form Page**
   - Partner details (pre-filled)
   - Agreement acknowledgment checkbox
   - License details input fields
   - Price calculation display
   - Submit button

3. **Order History Page**
   - List of past orders
   - Status tracking
   - Order details view

### Backend APIs
1. **Authentication Endpoints**
   - POST /api/v1/auth/partner-login
   - POST /api/v1/auth/partner-logout

2. **Order Endpoints**
   - POST /api/v1/partners/orders
   - GET /api/v1/partners/orders
   - GET /api/v1/partners/orders/{order_id}

3. **License Information Endpoints**
   - GET /api/v1/partners/products
   - GET /api/v1/partners/price-list

## Security Considerations
- Secure authentication
- HTTPS for all communications
- Input validation
- Audit logging for all order actions
```

## Implementation Plan
1. Create database schema extensions
2. Implement backend API endpoints
3. Create frontend pages
4. Implement order workflow
5. Add notifications for order processing
6. Set up partner account management
