# Building Access Control System

A scalable multi-building access control system with role-based door permissions, RFID card access verification, and comprehensive audit logging.

## Features

- 🏢 Multi-building, multi-floor, multi-office space management
- 🏢 Organization lease management
- 👥 Employee management with role-based access control
- 💳 RFID access card management
- 🚪 Flexible door grouping (PUBLIC, PRIVATE, RESTRICTED)
- 🔐 Real-time access verification for card readers
- 📊 Comprehensive access logging and audit trails
- ⏰ Time-bound access control with timezone support
- 🔥 Firebase authentication for admin API

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Admin SDK
- **Logging**: Winston
- **Validation**: Express-validator, Joi

## Prerequisites

- Node.js >= 18.0.0
- Supabase account and project
- Firebase project with Admin SDK credentials

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tripleHello
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. Run database migrations:
```bash
npm run migrate
```

5. (Optional) Seed database with demo data:
```bash
npm run seed
```

## Running the Application

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Documentation

### Authentication

All management endpoints require Firebase authentication. Include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

### Core Endpoints

#### Access Verification (No Auth Required)
- `POST /api/v1/access/verify` - Verify card access to door

#### Buildings
- `GET /api/v1/buildings` - List all buildings
- `POST /api/v1/buildings` - Create building
- `GET /api/v1/buildings/:id` - Get building details
- `PUT /api/v1/buildings/:id` - Update building
- `DELETE /api/v1/buildings/:id` - Delete building

#### Organizations
- `GET /api/v1/organizations` - List organizations
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations/:id` - Get organization
- `PUT /api/v1/organizations/:id` - Update organization

#### Employees
- `GET /api/v1/employees` - List employees
- `POST /api/v1/employees` - Create employee
- `POST /api/v1/employees/:id/issue-card` - Issue access card
- `PUT /api/v1/employees/:id` - Update employee
- `PATCH /api/v1/employees/:id/deactivate` - Deactivate employee

#### Doors & Door Groups
- `GET /api/v1/doors` - List doors
- `POST /api/v1/doors` - Create door
- `POST /api/v1/door-groups` - Create door group
- `POST /api/v1/doors/:id/groups` - Assign door to groups

#### Roles & Permissions
- `GET /api/v1/roles` - List roles
- `POST /api/v1/roles` - Create role (system roles require admin)
- `POST /api/v1/permissions` - Assign role permission to door group

#### Access Logs
- `GET /api/v1/access-logs` - Query access logs with filters

## Database Schema

See [migrations/supabase/migrations](migrations/supabase/migrations) for complete schema.

### Key Tables:
- `building`, `floor`, `office_space`
- `organization`, `lease`
- `employee`, `access_role`
- `access_card`
- `door`, `door_group`, `door_door_group` (junction)
- `role_door_group_permission`
- `access_log` (partitioned by month)

## Scripts

### Deactivate Expired Leases
```bash
npm run deactivate-leases
```

This script finds organizations with expired leases and marks all their employees' access cards as INACTIVE.

## Admin Access

Admin users are defined via the `ADMIN_EMAILS` environment variable. Only admin users can:
- Create system-wide roles
- Manage buildings
- View all organizations

## License

ISC
