# Building Access Control System - Setup Guide

## Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your actual credentials:

- **Supabase**: Get from your Supabase project settings
- **Firebase**: Download service account JSON from Firebase Console → Project Settings → Service Accounts
- **Admin Emails**: Add your email address for admin access

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Using Supabase SQL Editor (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `migrations/supabase/migrations/20260207_initial_schema.sql`
4. Paste and run it in the SQL Editor

#### Option B: Using Migration Script

```bash
npm run migrate
```

**Note**: This requires `psql` installed on your system.

#### Option C: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 4. Seed Demo Data (Optional)

```bash
npm run seed
```

This will create:
- 3 predefined system roles (Employee, Manager, IT Admin)
- 3 door groups (PUBLIC, PRIVATE, RESTRICTED)
- 1 demo building with 3 floors and 6 office spaces
- 2 demo organizations with leases
- 4 demo employees with access cards
- 6 doors assigned to various groups

### 5. Run the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:3000`

---

## Firebase Authentication Setup

### For Admin Users

Admin access is controlled by email whitelist in the `.env` file:

```env
ADMIN_EMAILS=admin@example.com,superadmin@example.com
```

### For Frontend Integration

1. Initialize Firebase in your frontend app
2. Sign in users with Firebase Authentication
3. Get the ID token: `await user.getIdToken()`
4. Include token in API requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${idToken}`
   }
   ```

---

## Testing the API

### 1. Health Check (No Auth)

```bash
curl http://localhost:3000/api/v1/health
```

### 2. Access Verification (No Auth - for card readers)

```bash
curl -X POST http://localhost:3000/api/v1/access/verify \
  -H "Content-Type: application/json" \
  -d '{
    "card_uid": "CARD-DEMO-0001",
    "door_id": "DOOR_UUID_HERE"
  }'
```

**Demo Cards** (if you ran seed script):
- `CARD-DEMO-0001` - John Doe (Employee role - public doors only)
- `CARD-DEMO-0002` - Jane Smith (Manager role - public + private)
- `CARD-DEMO-0003` - Bob Johnson (IT Admin - all doors)
- `CARD-DEMO-0004` - Alice Williams (Employee role)

### 3. Get Access Logs (Auth Required)

```bash
curl http://localhost:3000/api/v1/access/logs \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### 4. Create Employee (Auth Required)

```bash
curl -X POST http://localhost:3000/api/v1/employees \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "ORG_UUID",
    "role_id": "ROLE_UUID",
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

---

## Common Tasks

### Issue an Access Card

```bash
curl -X POST http://localhost:3000/api/v1/employees/{EMPLOYEE_ID}/issue-card \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "card_uid": "CARD-12345"
  }'
```

### Assign Role Permission to Door Group

```bash
curl -X POST http://localhost:3000/api/v1/doors/permissions \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": "ROLE_UUID",
    "door_group_id": "DOOR_GROUP_UUID",
    "access_type": "TIME_BOUND",
    "start_time": "09:00:00",
    "end_time": "17:00:00"
  }'
```

### Deactivate Expired Leases

```bash
npm run deactivate-leases
```

This finds organizations with expired leases and automatically marks their employees' cards as INACTIVE.

---

## Database Schema Overview

### Core Entities

1. **Building, Floor, Office Space** - Physical structure
2. **Organization, Lease** - Tenant management
3. **Employee, AccessRole** - People and permissions
4. **AccessCard** - RFID cards (1:1 with employees)
5. **Door, DoorGroup** - Physical access points
6. **DoorDoorGroup** - Junction table (many-to-many)
7. **RoleDoorGroupPermission** - Access control rules
8. **AccessLog** - Audit trail (partitioned by month)

### Key Relationships

- One employee has ONE access card
- One door can belong to MULTIPLE door groups
- Roles grant access to door groups (not individual doors)
- When employee.status = INACTIVE, card is auto-deactivated (trigger)

---

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com
```

### Security Checklist

- ✅ Use HTTPS in production
- ✅ Set proper CORS_ORIGIN (not *)
- ✅ Rotate Firebase service account keys regularly
- ✅ Use Supabase Row Level Security for additional protection
- ✅ Enable rate limiting (already configured)
- ✅ Monitor access logs for suspicious activity
- ✅ Set up firewall rules for card reader endpoints

### Recommended Hosting

- **API**: Railway, Render, Fly.io, AWS ECS
- **Database**: Supabase (already managed)
- **Logs**: CloudWatch, LogDNA, DataDog

---

## Maintenance

### Monthly Log Partition Creation

The `access_log` table is partitioned by month. Create new partitions as needed:

```sql
-- Create partition for March 2027
CREATE TABLE IF NOT EXISTS access_log_2027_03 PARTITION OF access_log
  FOR VALUES FROM ('2027-03-01') TO ('2027-04-01');
```

### Cleanup Old Logs

```sql
-- Drop partition older than 1 year
DROP TABLE IF EXISTS access_log_2025_01;
```

---

## Troubleshooting

### Error: "Environment validation error"

- Check that all required environment variables are set in `.env`
- Firebase private key must include the full key with `\n` characters

### Error: "CORS policy"

- Set `CORS_ORIGIN` in `.env` to your frontend URL
- For development, use `http://localhost:3000` or `*`

### Error: "Connection refused" to Supabase

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase project is not paused (free tier)
- Ensure network connectivity

### Access Always Denied

- Check that door is assigned to at least one door group
- Verify role has permission to that door group
- Check time restrictions if using TIME_BOUND access
- Ensure employee status is ACTIVE
- Ensure card status is ACTIVE

---

## API Documentation

Full API documentation available at: `/api/v1/health`

### Main Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/access/verify` | No | Verify card access |
| GET | `/api/v1/access/logs` | Yes | Get access logs |
| GET | `/api/v1/buildings` | Yes | List buildings |
| POST | `/api/v1/employees` | Yes | Create employee |
| POST | `/api/v1/employees/:id/issue-card` | Yes | Issue access card |
| POST | `/api/v1/doors` | Yes | Create door |
| POST | `/api/v1/doors/permissions` | Yes | Assign permissions |
| GET | `/api/v1/roles` | Yes | List roles |

---

## Support

For issues or questions:
1. Check the logs in `logs/` directory
2. Review the database schema
3. Test with demo data from seed script
4. Verify environment variables

---

## License

ISC
