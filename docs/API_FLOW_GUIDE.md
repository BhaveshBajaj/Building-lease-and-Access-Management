# API Flow Guide

This guide shows the complete flow for creating and managing buildings, office spaces, organizations, and leases in the Building Access Control System.

## Complete Setup Flow

### 1. Create an Organization

```http
POST /api/v1/organizations
Content-Type: application/json

{
  "name": "Acme Corporation",
  "description": "A leading tech company"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Organization created successfully",
  "data": {
    "id": "org-uuid-here",
    "name": "Acme Corporation",
    "description": "A leading tech company",
    "created_at": "2026-02-07T...",
    "updated_at": "2026-02-07T..."
  }
}
```

---

### 2. Create a Building

```http
POST /api/v1/buildings
Content-Type: application/json

{
  "name": "Tech Tower",
  "address": "123 Main Street, San Francisco, CA",
  "timezone": "America/Los_Angeles"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Building created successfully",
  "data": {
    "id": "building-uuid-here",
    "name": "Tech Tower",
    "address": "123 Main Street, San Francisco, CA",
    "timezone": "America/Los_Angeles",
    "created_at": "2026-02-07T...",
    "updated_at": "2026-02-07T..."
  }
}
```

---

### 3. Add Floors to Building

```http
POST /api/v1/buildings/{buildingId}/floors
Content-Type: application/json

{
  "floor_number": 5
}
```

**Note:** The `building_id` is automatically extracted from the URL parameter.

**Response:**
```json
{
  "status": "success",
  "message": "Floor created successfully",
  "data": {
    "id": "floor-uuid-here",
    "building_id": "building-uuid-here",
    "floor_number": 5,
    "created_at": "2026-02-07T...",
    "updated_at": "2026-02-07T..."
  }
}
```

---

### 4. Add Office Spaces to Floor

```http
POST /api/v1/buildings/floors/{floorId}/spaces
Content-Type: application/json

{
  "name": "Suite 501",
  "seat_capacity": 20
}
```

**Note:** The `floor_id` is automatically extracted from the URL parameter.

**Response:**
```json
{
  "status": "success",
  "message": "Office space created successfully",
  "data": {
    "id": "space-uuid-here",
    "floor_id": "floor-uuid-here",
    "name": "Suite 501",
    "seat_capacity": 20,
    "created_at": "2026-02-07T...",
    "updated_at": "2026-02-07T..."
  }
}
```

---

### 5. Create a Lease (Assign Office Space to Organization)

```http
POST /api/v1/organizations/{organizationId}/leases
Content-Type: application/json

{
  "office_space_id": "space-uuid-here",
  "start_date": "2026-02-01",
  "end_date": "2027-02-01"
}
```

**Note:** The `organization_id` is automatically extracted from the URL parameter.

**Response:**
```json
{
  "status": "success",
  "message": "Lease created successfully",
  "data": {
    "id": "lease-uuid-here",
    "organization_id": "org-uuid-here",
    "office_space_id": "space-uuid-here",
    "start_date": "2026-02-01",
    "end_date": "2027-02-01",
    "created_at": "2026-02-07T...",
    "updated_at": "2026-02-07T..."
  }
}
```

---

## Querying Data

### Get all floors in a building

```http
GET /api/v1/buildings/{buildingId}/floors
```

### Get all office spaces on a floor

```http
GET /api/v1/buildings/floors/{floorId}/spaces
```

### Get all leases for an organization

```http
GET /api/v1/organizations/{organizationId}/leases
```

### Get a specific lease

```http
GET /api/v1/organizations/{organizationId}/leases/{leaseId}
```

---

## Complete Example Workflow

1. **Create Organization:** `POST /api/v1/organizations`
2. **Create Building:** `POST /api/v1/buildings`
3. **Add Floor 1:** `POST /api/v1/buildings/{buildingId}/floors` with `{"floor_number": 1}`
4. **Add Floor 2:** `POST /api/v1/buildings/{buildingId}/floors` with `{"floor_number": 2}`
5. **Add Office Space on Floor 1:** `POST /api/v1/buildings/floors/{floor1Id}/spaces` with `{"name": "Suite 101", "seat_capacity": 10}`
6. **Add Office Space on Floor 2:** `POST /api/v1/buildings/floors/{floor2Id}/spaces` with `{"name": "Suite 201", "seat_capacity": 15}`
7. **Assign Office to Organization:** `POST /api/v1/organizations/{orgId}/leases` with `{"office_space_id": "{spaceId}", "start_date": "2026-02-01", "end_date": "2027-02-01"}`

---

## Dashboard APIs

### Get Overall Dashboard Statistics

Get system-wide statistics including total organizations, employees, and buildings.

```http
GET /api/v1/dashboard
```

**Response:**
```json
{
  "status": "success",
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalOrganizations": 5,
    "totalEmployees": 150,
    "activeEmployees": 145,
    "inactiveEmployees": 5,
    "totalBuildings": 3
  }
}
```

### Get Organization-Specific Statistics

Get detailed statistics for a specific organization.

```http
GET /api/v1/dashboard/organizations/{organizationId}
```

**Response:**
```json
{
  "status": "success",
  "message": "Organization statistics retrieved successfully",
  "data": {
    "organizationId": "org-uuid-here",
    "totalEmployees": 30,
    "activeEmployees": 28,
    "inactiveEmployees": 2,
    "totalLeases": 4,
    "activeLeases": 3,
    "expiredLeases": 1
  }
}
```

---

## Additional Endpoints

### Buildings
- `GET /api/v1/buildings` - Get all buildings
- `GET /api/v1/buildings/{id}` - Get building by ID
- `PUT /api/v1/buildings/{id}` - Update building
- `DELETE /api/v1/buildings/{id}` - Delete building

### Organizations
- `GET /api/v1/organizations` - Get all organizations
- `GET /api/v1/organizations/{id}` - Get organization by ID
- `PUT /api/v1/organizations/{id}` - Update organization
- `DELETE /api/v1/organizations/{id}` - Delete organization
- `GET /api/v1/organizations/{id}/roles` - Get roles for an organization
- `POST /api/v1/organizations/{id}/roles` - Create a role for an organization

### Dashboard
- `GET /api/v1/dashboard` - Get overall system statistics
- `GET /api/v1/dashboard/organizations/{id}` - Get organization-specific statistics

### Roles
- `GET /api/v1/roles` - Get all roles
- `GET /api/v1/roles/system` - Get system roles only
- `POST /api/v1/roles` - Create a role (requires organization_id or is_system_role)
- `GET /api/v1/roles/{id}` - Get role by ID
- `PUT /api/v1/roles/{id}` - Update role

### Employees
- `GET /api/v1/employees` - Get all employees
- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees/{id}` - Get employee by ID
- `PUT /api/v1/employees/{id}` - Update employee
- `DELETE /api/v1/employees/{id}` - Delete employee

### Access Cards
- `GET /api/v1/cards/{id}` - Get card by ID
- `GET /api/v1/cards/uid/{uid}` - Get card by UID
- `GET /api/v1/cards/employee/{employeeId}` - Get card by employee
- `POST /api/v1/cards` - Create access card
- `PUT /api/v1/cards/{id}` - Update card
- `PATCH /api/v1/cards/{id}/deactivate` - Deactivate card
- `PATCH /api/v1/cards/{id}/block` - Block card
- `DELETE /api/v1/cards/{id}` - Delete card

### Doors
- `GET /api/v1/doors` - Get all doors
- `POST /api/v1/doors` - Create door
- `GET /api/v1/doors/{id}` - Get door by ID
- `PUT /api/v1/doors/{id}` - Update door
- `DELETE /api/v1/doors/{id}` - Delete door

---

## Notes

- All endpoints require Firebase authentication (Bearer token in Authorization header)
- Some endpoints (building create/update/delete) require admin role
- Date validation is enforced - end_date must be after start_date for leases
- All IDs are UUIDs
- Timestamps are in ISO 8601 format
