# Building Access Control System - Frontend Analysis

## 1. User Personas

### 1.1 Building Administrator (Super Admin)
- **Who**: Building management staff, IT administrators
- **Goals**: Full system control, monitor all access, manage all entities
- **Access Level**: Everything

### 1.2 Organization Administrator
- **Who**: HR managers, office managers of tenant companies
- **Goals**: Manage their organization's employees, view their access logs
- **Access Level**: Their organization only

### 1.3 Security Personnel
- **Who**: Security guards, reception staff
- **Goals**: Real-time monitoring, quick lookup, incident response
- **Access Level**: View-only for logs, can report lost cards

---

## 2. User Flows

### Flow 1: Employee Onboarding
```
Login → Organizations → Select Org → Employees → Add Employee 
→ Fill Details → Select Role → Save → Issue Card → Done
```

### Flow 2: Card Replacement (Lost Card)
```
Login → Search Employee → View Details → Report Card Lost 
→ Confirm Block → Issue New Card → Assign to Employee → Done
```

### Flow 3: Access Issue Investigation
```
Login → Access Logs → Filter by Employee/Door/Date 
→ View Denied Attempts → Check Permission Details 
→ Modify Role Permissions if needed → Done
```

### Flow 4: New Tenant Onboarding
```
Login → Organizations → Create Organization 
→ Leases → Assign Office Space → Create Org Admin Role 
→ Add First Employee → Issue Card → Done
```

### Flow 5: Door Configuration
```
Login → Doors → Add New Door → Set Location/Floor 
→ Assign to Door Groups → Verify Permissions → Done
```

### Flow 6: Real-time Monitoring
```
Login → Dashboard → View Live Feed 
→ See Access Attempts → Click for Details → Take Action if Denied
```

---

## 3. Screen Inventory (32 Screens)

### Authentication (2)
1. **Login** - Email/password with Firebase Auth
2. **Forgot Password** - Email-based reset

### Dashboard (2)
3. **Main Dashboard** - Stats, charts, recent activity, alerts
4. **Live Monitor** - Real-time access feed

### Buildings & Spaces (5)
5. **Buildings List** - All buildings with key metrics
6. **Building Details** - Floors, office spaces, doors count
7. **Floor Management** - Add/edit floors, view spaces
8. **Office Spaces List** - All spaces with lease status
9. **Office Space Details** - Capacity, current tenant, doors

### Organizations (4)
10. **Organizations List** - All tenants with stats
11. **Organization Details** - Info, employees, leases
12. **Create/Edit Organization** - Form
13. **Lease Management** - Assign/manage office spaces

### Employees (5)
14. **Employees List** - Search, filter, bulk actions
15. **Employee Details** - Full profile, card, access history
16. **Create Employee** - Multi-step form
17. **Edit Employee** - Update details, role
18. **Employee Access History** - Personal access log

### Access Cards (4)
19. **Cards Overview** - All cards with status
20. **Card Details** - Card info, linked employee
21. **Issue New Card** - Card assignment form
22. **Card Actions** - Block, report lost, replace

### Doors & Groups (5)
23. **Doors List** - All doors with groups
24. **Door Details** - Location, groups, access stats
25. **Create/Edit Door** - Door configuration form
26. **Door Groups List** - PUBLIC, PRIVATE, RESTRICTED + custom
27. **Door Group Details** - Doors in group, permissions

### Roles & Permissions (4)
28. **Roles List** - System + custom roles
29. **Role Details** - Permissions, employees with role
30. **Create/Edit Role** - Role configuration
31. **Permission Matrix** - Visual role-to-door-group mapping

### Access Logs & Reports (3)
32. **Access Logs** - Filterable log table
33. **Denied Access Report** - Security-focused view
34. **Analytics Dashboard** - Charts, trends, statistics

### Settings (2)
35. **System Settings** - App configuration
36. **User Profile** - Personal settings

---

## 4. Component Architecture

### Layout Components
- `AppShell` - Main layout with sidebar
- `Sidebar` - Navigation menu
- `Header` - Top bar with search, notifications, user menu
- `Breadcrumbs` - Navigation trail

### Common Components
- `DataTable` - Sortable, filterable table
- `SearchBar` - Global search
- `StatsCard` - Metric display
- `StatusBadge` - Active/Inactive/Blocked badges
- `ConfirmDialog` - Action confirmation
- `FormField` - Input with validation
- `LoadingSpinner` - Loading states
- `EmptyState` - No data placeholder
- `ErrorBoundary` - Error handling

### Feature Components
- `AccessLogFeed` - Real-time log display
- `PermissionMatrix` - Role-permission grid
- `EmployeeCard` - Employee summary card
- `DoorStatusIndicator` - Door access status
- `CardStatusBadge` - Card status display

---

## 5. Navigation Structure

```
├── Dashboard
│   ├── Overview
│   └── Live Monitor
├── Buildings
│   ├── Buildings List
│   ├── Floors
│   └── Office Spaces
├── Organizations
│   ├── Organizations List
│   ├── Leases
│   └── [Org Details]
├── People
│   ├── Employees
│   ├── Access Cards
│   └── Roles
├── Access Control
│   ├── Doors
│   ├── Door Groups
│   └── Permissions
├── Reports
│   ├── Access Logs
│   ├── Denied Access
│   └── Analytics
└── Settings
    ├── System
    └── Profile
```

---

## 6. Key UI Patterns

### List Pages
- Search bar with filters
- Data table with pagination
- Bulk action toolbar
- Quick actions per row
- Export functionality

### Detail Pages
- Header with key info + actions
- Tabbed content sections
- Related data panels
- Activity timeline

### Forms
- Multi-step for complex entities
- Inline validation
- Auto-save drafts
- Clear error messages

### Real-time Features
- WebSocket for live updates
- Toast notifications
- Status indicators
- Auto-refresh option

---

## 7. Color Scheme & Status Indicators

### Access Status
- **GRANTED**: Green (#22C55E)
- **DENIED**: Red (#EF4444)

### Card Status
- **ACTIVE**: Green
- **INACTIVE**: Gray
- **LOST**: Orange
- **BLOCKED**: Red

### Employee Status
- **ACTIVE**: Green
- **INACTIVE**: Gray

### Door Group Types
- **PUBLIC**: Blue
- **PRIVATE**: Purple
- **RESTRICTED**: Red

---


---

## 9. State Management Needs

### Global State
- User authentication
- Current user info
- Notifications
- Theme preferences

### Feature State
- Selected organization filter
- Table pagination/filters
- Form drafts

### Real-time State
- Live access feed
- Active alerts
- WebSocket connection status
