# Stitch UI Generation Prompts - Building Access Control System

> **Instructions**: Use these prompts with Stitch (powered by Google) to generate professional UI screens. Each prompt is designed to create a cohesive, modern admin dashboard experience.

---

## Global Design System Prompt (Use First)

```
Create a modern admin dashboard design system for a WeWork-style building access control application with these specifications:

**Brand & Colors:**
- Primary: Deep Blue (#1E40AF)
- Secondary: Slate (#475569)
- Success/Granted: Green (#22C55E)
- Error/Denied: Red (#EF4444)
- Warning: Amber (#F59E0B)
- Background: Light Gray (#F8FAFC)
- Cards: White (#FFFFFF)

**Typography:**
- Font: Inter or SF Pro
- Headings: Bold, dark slate
- Body: Regular, gray-700
- Captions: Small, gray-500

**Component Style:**
- Cards with subtle shadows and rounded corners (8px)
- Tables with hover states and zebra striping
- Buttons: Filled primary, outlined secondary
- Status badges: Pill-shaped with color coding
- Icons: Lucide or Heroicons style

**Layout:**
- Fixed sidebar navigation (240px wide, collapsible)
- Top header with search, notifications, user menu
- Main content area with breadcrumbs
- Responsive grid system
```

---

## AUTHENTICATION SCREENS

### Screen 1: Login Page

```
Design a clean, modern login page for "AccessHub" - a building access control system.

**Layout:**
- Split screen: Left side brand/illustration, right side form
- Or centered card on gradient background

**Left Side (if split):**
- App logo "AccessHub" with building/key icon
- Tagline: "Smart Building Access Control"
- Abstract illustration of a modern building with access points
- Subtle animated gradient background

**Right Side / Login Form:**
- "Welcome back" heading
- "Sign in to your account" subtext
- Email input field with envelope icon
- Password input field with lock icon, show/hide toggle
- "Remember me" checkbox
- "Forgot password?" link
- "Sign In" primary button (full width)
- Divider with "or"
- "Sign in with Google" button with Google icon

**Footer:**
- "Don't have an account? Contact your administrator"
- Copyright © 2026 AccessHub

**States:**
- Loading state with spinner on button
- Error state with red border on fields
- Success redirect animation
```

### Screen 2: Forgot Password

```
Design a forgot password page for AccessHub.

**Layout:**
- Centered card on subtle background
- Back to login link at top

**Card Content:**
- Lock icon or key illustration at top
- "Forgot Password?" heading
- "Enter your email and we'll send you a reset link" subtext
- Email input field
- "Send Reset Link" primary button
- "Back to Login" text link

**Success State:**
- Checkmark icon
- "Check your email" heading
- "We've sent a password reset link to [email]"
- "Didn't receive it? Resend" link

**Error State:**
- Red alert box for invalid email or not found
```

---

## DASHBOARD SCREENS

### Screen 3: Main Dashboard

```
Design the main dashboard for AccessHub building access control system.

**Header:**
- "Dashboard" page title
- Date/time display
- "Last updated: X minutes ago" with refresh button

**Stats Row (4 cards):**
1. Total Employees - number with up/down trend arrow
2. Active Cards - number with status indicator
3. Access Today - number of access attempts
4. Denied Today - number in red with alert if high

**Main Content Grid:**

**Left Column (60%):**
- "Recent Access Activity" card
  - Real-time feed showing last 10 access attempts
  - Each row: Time | Employee name & photo | Door name | Status badge (GRANTED green / DENIED red)
  - "View All" link

- "Access by Hour" chart card
  - Bar chart showing access volume by hour (24h)
  - Green for granted, red stacked for denied

**Right Column (40%):**
- "Quick Actions" card
  - Issue New Card button
  - Add Employee button
  - View Denied Access button
  - Run Reports button

- "System Status" card
  - Database: Online (green dot)
  - Card Readers: 12/12 Active
  - Last Sync: 2 minutes ago

- "Alerts" card
  - List of recent alerts
  - "5 failed access attempts from Card #1234"
  - "Lease expiring in 7 days: TechStart Inc"
  - Each with timestamp and severity icon

**Footer:**
- Mini navigation: Buildings (3) | Organizations (2) | Employees (45) | Doors (6)
```

### Screen 4: Live Access Monitor

```
Design a real-time access monitoring screen for security personnel.

**Layout:**
- Full-width, minimal chrome for focus
- Dark mode option for security stations

**Header:**
- "Live Access Monitor" title
- Connection status indicator (green dot + "Connected")
- Sound toggle (on/off for alerts)
- Filter dropdown: All | Granted | Denied
- Building selector dropdown

**Main Content:**
- Large scrolling feed of access attempts
- Auto-scrolls with new entries at top

**Each Entry Card:**
- Large status indicator (green checkmark or red X)
- Employee photo (large, 64px)
- Employee name (bold)
- Organization name (smaller, gray)
- Door name + location
- Timestamp (relative: "Just now", "2 min ago")
- If DENIED: Reason badge ("No Permission", "Inactive Card", etc.)

**Sidebar (collapsible):**
- Statistics for current session
  - Total attempts
  - Granted count
  - Denied count
  - Denial rate percentage

- "Hot Spots" - doors with most activity
- "Flagged Cards" - cards with recent denials

**Alert Mode:**
- When denied access occurs:
  - Entry flashes red
  - Optional sound alert
  - Entry stays highlighted for 30 seconds
```

---

## BUILDING MANAGEMENT SCREENS

### Screen 5: Buildings List

```
Design a buildings list page for multi-building management.

**Header:**
- "Buildings" page title with building icon
- "Add Building" primary button

**Content:**
- Grid of building cards (3 per row on desktop)

**Each Building Card:**
- Building image/thumbnail at top (or placeholder gradient)
- Building name (bold)
- Address (gray text)
- Stats row:
  - Floors: 3
  - Offices: 12
  - Doors: 24
- Status badge: Active/Inactive
- Timezone indicator
- Quick actions: View | Edit | Delete

**Empty State:**
- Illustration of building
- "No buildings yet"
- "Add your first building to get started"
- "Add Building" button
```

### Screen 6: Building Details

```
Design a building details page showing floors and office spaces.

**Header:**
- Back arrow + breadcrumb: "Buildings > TechHub Tower"
- Building name as page title
- Address below
- Actions: Edit | Delete | Add Floor

**Info Section:**
- Card with building details
  - Timezone: America/New_York
  - Created: Jan 1, 2026
  - Total Floors: 3
  - Total Office Spaces: 6
  - Total Doors: 12

**Floors Section:**
- "Floors" section heading
- List/accordion of floors

**Each Floor Row:**
- Floor number badge (e.g., "F1", "F2")
- Floor name if any
- Office space count: "4 office spaces"
- Door count: "8 doors"
- Expand arrow

**Expanded Floor:**
- Grid of office space cards
  - Space name (Suite 101)
  - Capacity: 20 seats
  - Leased to: Acme Corp (or "Available")
  - Actions: View | Edit

**Visual Map (Optional):**
- Simple floor plan visualization
- Clickable rooms/doors
```

### Screen 7: Floor Management Modal/Page

```
Design a floor management interface.

**Modal or Page:**
- "Add New Floor" / "Edit Floor" heading

**Form Fields:**
- Building (pre-selected, read-only if editing)
- Floor Number (integer input)
- Floor Name (optional, text input)

**If Editing:**
- List of office spaces on this floor
- "Add Office Space" button

**Office Space Quick Add:**
- Inline form
- Name, Seat Capacity
- Add button
```

### Screen 8: Office Spaces List

```
Design an office spaces overview page.

**Header:**
- "Office Spaces" title
- Filters: Building dropdown, Floor dropdown, Status (All/Leased/Available)
- "Add Office Space" button

**Table Columns:**
1. Space Name
2. Building > Floor
3. Seat Capacity
4. Lease Status (badge: Leased/Available/Expiring Soon)
5. Current Tenant (org name or "--")
6. Doors (count)
7. Actions (View, Edit, Assign Lease)

**Quick Stats Bar:**
- Total Spaces: 24
- Leased: 18
- Available: 6
- Expiring Soon: 2
```

### Screen 9: Office Space Details

```
Design an office space detail page.

**Header:**
- Breadcrumb: Buildings > TechHub Tower > Floor 1 > Suite 101
- "Suite 101" title
- Status badge: Leased / Available
- Actions: Edit | Delete | Manage Lease

**Info Card:**
- Location: TechHub Tower, Floor 1
- Seat Capacity: 20
- Created: Jan 1, 2026

**Lease Information Card:**
- If leased:
  - Tenant: Acme Corp (linked)
  - Lease Period: Jan 1, 2026 - Dec 31, 2026
  - Days Remaining: 327
  - Progress bar showing lease timeline
- If available:
  - "No active lease"
  - "Assign to Organization" button

**Doors in this Space:**
- List of doors
- Door name, group badges (PUBLIC/PRIVATE/RESTRICTED)
- Quick link to door details

**Activity:**
- Recent access attempts at doors in this space
```

---

## ORGANIZATION SCREENS

### Screen 10: Organizations List

```
Design an organizations list page showing tenant companies.

**Header:**
- "Organizations" title
- Search bar
- "Add Organization" button

**Table View:**
Columns:
1. Organization name (with small logo if available)
2. Office Space(s) leased
3. Employee Count
4. Active Cards
5. Created Date
6. Actions (View, Edit, Delete)

**Or Card Grid View:**
Each card:
- Organization logo/initial avatar
- Name
- Stats: 15 employees, 14 active cards
- Leased: Suite 101, Suite 102
- Lease status indicator
- "View Details" button

**Filters:**
- Status: Active / All
- Has Active Lease: Yes / No
```

### Screen 11: Organization Details

```
Design an organization detail page.

**Header:**
- Organization logo (large) + Name
- Status badge: Active
- Actions: Edit | Delete | Add Employee

**Tab Navigation:**
- Overview | Employees | Leases | Access Logs | Roles

**Overview Tab:**
- Info card with created date, description
- Stats cards:
  - Total Employees
  - Active Cards
  - Office Spaces
  - Access Today

- Recent Activity feed

**Employees Tab:**
- Employee list table (subset of main employees list)
- Filtered to this organization
- "Add Employee" button

**Leases Tab:**
- List of current and past leases
- Office space, dates, status
- "Add Lease" button

**Access Logs Tab:**
- Filtered access logs for this organization's employees

**Roles Tab:**
- Organization-specific roles (if any)
- "Create Role" button
```

### Screen 12: Create/Edit Organization Form

```
Design an organization creation/edit form.

**Modal or Page:**
- "Create New Organization" / "Edit Organization" heading

**Form Sections:**

**Basic Information:**
- Organization Name* (text input)
- Description (textarea)
- Logo upload (drag & drop area)

**Contact Information:**
- Primary Contact Name
- Primary Contact Email
- Phone Number

**Initial Setup (Create only):**
- Checkbox: "Create default admin role"
- Checkbox: "Add initial employee"

**Actions:**
- Cancel button
- Save / Create button (primary)

**Validation:**
- Name is required
- Email format validation
```

### Screen 13: Lease Management

```
Design a lease assignment interface.

**Page Header:**
- "Manage Leases" title
- Filter by organization or office space

**Create Lease Form:**
- Organization dropdown (searchable)
- Office Space dropdown (shows availability)
- Start Date picker
- End Date picker
- Preview: "Lease duration: 12 months"

**Active Leases Table:**
Columns:
1. Organization
2. Office Space
3. Start Date
4. End Date
5. Days Remaining
6. Status (Active/Expiring/Expired)
7. Actions (View, Edit, Terminate)

**Visual Timeline:**
- Gantt-style chart showing lease timelines
- Color coded by status
```

---

## EMPLOYEE SCREENS

### Screen 14: Employees List

```
Design a comprehensive employee list page.

**Header:**
- "Employees" title with count badge (45)
- Search bar (search by name, email, card)
- Filters: Organization, Role, Status, Has Card
- "Add Employee" primary button
- Export button (CSV/Excel)

**Bulk Actions Bar (when items selected):**
- Selected: 3 employees
- Deactivate | Change Role | Export | Clear Selection

**Table:**
Columns:
1. Checkbox (for bulk select)
2. Employee (photo + name + email)
3. Organization
4. Role (badge)
5. Card Status (Active/None/Lost/Blocked)
6. Card UID (if has card)
7. Status (Active/Inactive badge)
8. Last Access (relative time)
9. Actions dropdown (View, Edit, Issue Card, Deactivate)

**Pagination:**
- Showing 1-20 of 45 employees
- Page numbers
- Items per page selector

**Quick Filters Sidebar (optional):**
- Status checkboxes
- Role checkboxes
- Organization checkboxes
- Has Card toggle
```

### Screen 15: Employee Details

```
Design a detailed employee profile page.

**Header:**
- Large employee photo (with upload option)
- Name (large)
- Email (linked, clickable)
- Organization name (linked)
- Role badge
- Status badge
- Actions: Edit | Issue Card | Deactivate | Delete

**Content Tabs:**
- Profile | Access Card | Access History | Permissions

**Profile Tab:**
- Personal Information card
  - Name, Email, Created Date, Last Updated
- Organization Details card
  - Organization name (linked)
  - Role with description
- Quick Stats
  - Total Access Attempts: 234
  - This Month: 45
  - Denied Attempts: 2

**Access Card Tab:**
- If has card:
  - Card visualization (card-shaped design)
  - Card UID: CARD-DEMO-0001
  - Status: Active (green badge)
  - Issued: Jan 15, 2026
  - Actions: Block Card | Report Lost | Replace Card
- If no card:
  - "No card assigned"
  - "Issue New Card" button

**Access History Tab:**
- Table of access attempts
- Columns: Date/Time, Door, Status, Denial Reason
- Filters: Date range, Status

**Permissions Tab:**
- Visual of what this employee can access
- Role: Employee
- Door Groups: PUBLIC
- Doors they can access (list with location)
```

### Screen 16: Create Employee (Multi-step)

```
Design a multi-step employee creation form.

**Progress Indicator:**
- Step 1: Basic Info (current)
- Step 2: Organization & Role
- Step 3: Access Card
- Step 4: Review

**Step 1: Basic Information**
- Full Name* (text input)
- Email Address* (email input)
- Phone (optional)
- Photo upload (optional drag & drop)
- Next button

**Step 2: Organization & Role**
- Organization* (dropdown, searchable)
- Role* (dropdown, filtered by org)
- Preview: Role permissions shown
- Back | Next buttons

**Step 3: Access Card**
- "Issue access card now?" toggle
- If yes:
  - Card UID input (or auto-generate)
  - Scan card option (if hardware available)
  - "Card UID will be: CARD-AUTO-XXXX"
- If no:
  - "You can issue a card later from the employee profile"
- Back | Next buttons

**Step 4: Review**
- Summary of all entered information
- Editable sections (click to go back to step)
- "Create Employee" primary button
- Back button

**Success State:**
- Checkmark animation
- "Employee Created Successfully!"
- Quick actions: View Profile | Add Another | Go to Employees List
```

### Screen 17: Edit Employee

```
Design an employee edit form.

**Page/Modal:**
- "Edit Employee" heading
- Employee name + photo preview

**Form Sections:**
- Basic Information (editable)
- Organization (editable with warning about card)
- Role (dropdown)
- Status (Active/Inactive toggle with confirmation)

**Danger Zone:**
- "Deactivate Employee" button with warning
- "Delete Employee" button with confirmation

**Actions:**
- Cancel | Save Changes
```

### Screen 18: Employee Access History

```
Design a dedicated access history page for an employee.

**Header:**
- Back to employee profile
- Employee name + photo
- "Access History" title

**Filters Bar:**
- Date range picker (presets: Today, This Week, This Month, Custom)
- Door filter dropdown
- Status filter (All, Granted, Denied)
- Search/Filter button

**Summary Stats:**
- Total Attempts: 234
- Granted: 230 (98%)
- Denied: 4 (2%)
- Most Used Door: Main Entrance

**Timeline/Table Toggle:**

**Table View:**
- Columns: Date/Time, Door, Location, Status, Denial Reason
- Sortable
- Paginated

**Timeline View:**
- Vertical timeline
- Each entry shows time, door, status
- Grouped by day
- Expandable details

**Export:**
- Download CSV button
```

---

## ACCESS CARD SCREENS

### Screen 19: Cards Overview

```
Design an access cards management page.

**Header:**
- "Access Cards" title with count
- Search by card UID or employee name
- Filters: Status (All, Active, Inactive, Lost, Blocked)
- "Issue New Card" button

**Stats Cards Row:**
- Total Cards: 45
- Active: 40
- Inactive: 2
- Lost: 2
- Blocked: 1

**Table:**
Columns:
1. Card UID (monospace font)
2. Employee (photo + name)
3. Organization
4. Status (colored badge)
5. Issued Date
6. Last Used (relative time)
7. Actions (View, Block, Report Lost)

**Quick Actions:**
- Right-click or dropdown menu per row
- Block Card
- Report Lost
- View History
- Replace Card
```

### Screen 20: Card Details

```
Design a card detail page.

**Header:**
- Card UID as title (large, monospace)
- Status badge (large)
- Actions: Block | Report Lost | Replace | Delete

**Card Visualization:**
- Visual card design showing:
  - AccessHub logo
  - Card UID
  - Employee name
  - Organization
  - Status indicator

**Card Information:**
- Status: Active
- Issued: Jan 15, 2026
- Employee: John Doe (linked)
- Organization: Acme Corp (linked)

**Recent Activity:**
- Last 10 access attempts with this card
- View full history link

**Card Lifecycle:**
- Timeline showing:
  - Issued date
  - Any status changes
  - Block events
  - Replacement events
```

### Screen 21: Issue New Card Modal

```
Design a card issuance modal/dialog.

**Modal Header:**
- "Issue New Access Card"
- Close X button

**Content:**
- Employee selection (if not pre-selected)
  - Search/select dropdown
  - Shows employee photo, name, org
  - Warning if employee already has active card

- Card UID input
  - Auto-generate option (default checked)
  - Manual entry field
  - "Scan from reader" button (if hardware)

- Issue Date (defaults to now)

**Preview:**
- Card preview showing how it will look

**Actions:**
- Cancel | Issue Card (primary)

**Confirmation:**
- "Card issued successfully!"
- Card UID displayed for reference
- "View Card" | "Issue Another" | "Close"
```

### Screen 22: Card Actions Modal

```
Design modals for card actions (Block, Report Lost, Replace).

**Block Card Modal:**
- Warning icon
- "Block Card?"
- "This will immediately prevent this card from accessing any doors."
- Card UID and employee name displayed
- Reason dropdown: Suspended, Security Concern, Other
- Optional notes textarea
- Cancel | Block Card (red button)

**Report Lost Modal:**
- Alert icon
- "Report Card as Lost"
- "The card will be blocked and employee won't be able to access until a new card is issued."
- "Issue replacement card immediately?" checkbox
  - If checked, show new card UID field
- Cancel | Report Lost & Block (red button)

**Replace Card Modal:**
- "Replace Card"
- "This will block the current card and issue a new one."
- Current Card: [UID] (will be blocked)
- New Card UID: [auto-generated or input]
- Cancel | Replace Card (primary)
```

---

## DOORS & GROUPS SCREENS

### Screen 23: Doors List

```
Design a doors management list page.

**Header:**
- "Doors" title with count
- Filters: Building, Floor, Door Group
- "Add Door" button

**Table:**
Columns:
1. Door Name
2. Location (Building > Floor or Office Space)
3. Door Groups (multiple badges: PUBLIC, PRIVATE)
4. Access Today (count)
5. Last Access (relative time)
6. Actions (View, Edit, Delete)

**Grouped View Option:**
- Group by Building
- Collapsible sections
- Each building shows its doors

**Map View Option (Advanced):**
- Building floor plan
- Doors as clickable pins
- Hover for quick info
```

### Screen 24: Door Details

```
Design a door detail page.

**Header:**
- Door name as title
- Location badge
- Actions: Edit | Delete | View Access Logs

**Information Card:**
- Name: Main Entrance
- Location: TechHub Tower, Ground Floor Lobby
- Office Space: -- (not in an office)
- Floor: Ground Floor

**Door Groups Card:**
- "Assigned Door Groups"
- List of group badges with remove option
- "PUBLIC" with description
- Add group dropdown button

**Access Permissions:**
- "Who can access this door?"
- Table of roles that have permission
- Role name | Access Type | Time Restriction
- Employee | ALWAYS | --
- Manager | ALWAYS | --

**Access Statistics:**
- Today: 45 accesses
- This Week: 234
- Chart: Access by hour
- Top users list

**Recent Activity:**
- Last 10 access attempts
- Full history link
```

### Screen 25: Create/Edit Door Form

```
Design a door creation/edit form.

**Form Header:**
- "Add New Door" / "Edit Door"

**Form Fields:**
- Door Name* (text input)
- Location Description* (text input)
- Building* (dropdown)
- Floor* (dropdown, filtered by building)
- Office Space (optional dropdown, filtered by floor)

**Door Groups Assignment:**
- "Assign to Door Groups"
- Checkbox list of available groups
- [ ] Public Areas (PUBLIC)
- [ ] Private Offices (PRIVATE)
- [ ] Restricted Areas (RESTRICTED)
- At least one required

**Preview:**
- "This door will be accessible by:"
- List of roles based on selected groups

**Actions:**
- Cancel | Save Door
```

### Screen 26: Door Groups List

```
Design a door groups management page.

**Header:**
- "Door Groups" title
- "Create Door Group" button (if custom groups allowed)

**Cards Grid:**

Each Door Group Card:
- Type badge (PUBLIC/PRIVATE/RESTRICTED) with color
- Name: "Public Areas"
- Description: "Lobbies, stairways, cafeteria, common areas"
- Stats:
  - Doors: 6
  - Roles with access: 3
- Actions: View | Edit (if custom)

**System Groups Note:**
- Info banner: "System groups (PUBLIC, PRIVATE, RESTRICTED) cannot be modified."

**Permissions Matrix Link:**
- "View full permission matrix" button
```

### Screen 27: Door Group Details

```
Design a door group detail page.

**Header:**
- Group name + type badge
- Description

**Doors in this Group:**
- List of doors assigned to this group
- Door name, location
- Remove from group option (X button)
- "Add Door" button

**Roles with Access:**
- Table of roles that can access this group
- Role Name | Access Type | Time Restriction
- Shows which roles have permission to this group
- "Manage Permissions" link

**Access Statistics:**
- Combined stats for all doors in group
- Chart showing access patterns
```

---

## ROLES & PERMISSIONS SCREENS

### Screen 28: Roles List

```
Design a roles management page.

**Header:**
- "Roles" title
- Filter: System Roles / Organization Roles / All
- "Create Role" button

**Table:**
Columns:
1. Role Name
2. Type (System badge / Org name)
3. Description
4. Employees (count)
5. Permissions (count of door groups)
6. Actions (View, Edit, Delete)

**System Roles Section:**
- Employee | PUBLIC | 12 employees
- Manager | PUBLIC, PRIVATE | 5 employees
- IT Admin | ALL | 2 employees

**Organization Roles Section:**
- Custom roles by organization
- [Acme Corp] Team Lead | PRIVATE | 3 employees
```

### Screen 29: Role Details

```
Design a role detail page.

**Header:**
- Role name as title
- System/Organization badge
- Actions: Edit | Delete (if custom) | Clone

**Description Card:**
- Role description
- Created date
- Organization (if org-specific)

**Permissions Card:**
- "Door Group Permissions"
- Table:
  - Door Group | Type | Access Type | Time Restriction
  - Public Areas | PUBLIC | ALWAYS | --
  - Private Offices | PRIVATE | TIME_BOUND | 09:00 - 18:00
- "Edit Permissions" button

**Employees with this Role:**
- List of employees
- Photo, name, organization
- "View all X employees" link

**Effective Access:**
- Visual showing all doors this role can access
- Grouped by building/floor
```

### Screen 30: Create/Edit Role Form

```
Design a role creation/edit form.

**Form Header:**
- "Create New Role" / "Edit Role"

**Basic Information:**
- Role Name* (text input)
- Description (textarea)
- Organization (dropdown, or "System Role" if admin)

**Permissions Section:**
- "Assign Door Group Permissions"
- For each door group:
  - Checkbox to include
  - Access type: ALWAYS / TIME_BOUND
  - If TIME_BOUND:
    - Start Time picker
    - End Time picker
    - Days of week checkboxes (optional)

**Preview:**
- "Employees with this role will be able to access:"
- List of doors based on selected permissions

**Actions:**
- Cancel | Save Role
```

### Screen 31: Permission Matrix

```
Design a visual permission matrix page.

**Header:**
- "Permission Matrix"
- View toggle: Matrix / List

**Matrix View:**
- Rows: Roles (Employee, Manager, IT Admin, custom...)
- Columns: Door Groups (PUBLIC, PRIVATE, RESTRICTED, custom...)
- Cells: 
  - ✓ for ALWAYS access (green)
  - Clock icon for TIME_BOUND (yellow)
  - Empty for no access (gray)
  - Clickable to edit

**Filters:**
- Filter by organization
- Show system roles only
- Show custom roles only

**Legend:**
- Green check = Always allowed
- Yellow clock = Time restricted
- Gray = No access

**Quick Edit:**
- Click cell to toggle permission
- Modal opens for time configuration
- Save changes button

**Export:**
- Export matrix as PDF/image
```

---

## ACCESS LOGS & REPORTS

### Screen 32: Access Logs

```
Design a comprehensive access logs page.

**Header:**
- "Access Logs" title
- Real-time indicator (if live)
- Export button (CSV, Excel, PDF)

**Filters Bar:**
- Date range picker with presets
- Employee search/select
- Door filter (multi-select)
- Organization filter
- Status: All / Granted / Denied
- "Apply Filters" button | "Clear" button

**Summary Stats:**
- Total: 1,234 | Granted: 1,180 (95.6%) | Denied: 54 (4.4%)
- Time period indicator

**Table:**
Columns:
1. Timestamp (sortable)
2. Employee (photo + name)
3. Organization
4. Card UID
5. Door
6. Location
7. Status (GRANTED green / DENIED red badge)
8. Denial Reason (if denied)

**Row Expansion:**
- Click row to expand for full details
- Show employee role, door groups, exact timestamp

**Pagination:**
- Large dataset support
- Jump to page
- Items per page: 25, 50, 100
```

### Screen 33: Denied Access Report

```
Design a security-focused denied access report page.

**Header:**
- "Denied Access Report" title
- Alert icon if recent denials
- Date range selector

**Alert Summary:**
- Total Denied: 54 in selected period
- Cards with multiple denials: 5
- Doors with most denials: Main Entrance (12)

**Flagged Cards Section:**
- Cards with 3+ denials in period
- Card UID | Employee | Denial Count | Last Attempt
- Quick action: View Card | Block

**Denial Breakdown:**
- Pie chart by reason:
  - No Permission: 45%
  - Inactive Card: 30%
  - Card Not Found: 15%
  - Time Restriction: 10%

**Detailed Log:**
- Same as access logs but filtered to denied only
- Sorted by most recent first

**Recommendations:**
- AI-generated insights (optional)
- "5 employees attempted to access Server Room without permission"
- "Consider reviewing IT Admin assignments"
```

### Screen 34: Analytics Dashboard

```
Design an analytics and reporting dashboard.

**Header:**
- "Analytics" title
- Date range selector
- Compare to previous period toggle

**KPI Cards Row:**
- Total Access Attempts | % change
- Unique Employees Active | % change
- Average Daily Accesses | trend
- Denial Rate | % change (green if down)

**Charts Section:**

**Access Volume Chart (Large):**
- Line chart: Daily access volume over time
- Overlaid: Granted vs Denied
- Hover for details

**Access by Hour Heatmap:**
- 7x24 grid (days x hours)
- Color intensity = volume
- Shows peak usage times

**Top Doors:**
- Bar chart of most accessed doors
- Sortable by total, granted, denied

**Access by Organization:**
- Pie/donut chart
- Organization breakdown

**Access by Role:**
- Horizontal bar chart
- Employees vs Managers vs IT Admin

**Export Options:**
- Download full report (PDF)
- Schedule automated reports (email)
- Custom report builder link
```

---

## SETTINGS SCREENS

### Screen 35: System Settings

```
Design a system settings page.

**Sidebar Navigation:**
- General
- Security
- Notifications
- Integrations
- Backup

**General Settings:**
- Application Name: AccessHub
- Default Timezone dropdown
- Date/Time format preferences
- Language selector

**Security Settings:**
- Session timeout (minutes)
- Failed login attempts before lockout
- Require 2FA for admins toggle
- Password policy settings

**Notification Settings:**
- Email notifications toggle
- Notify on: checkboxes
  - High denial rate
  - Card blocked
  - Lease expiring
  - New employee added
- Alert thresholds (e.g., denials > 5 in 1 hour)

**Integrations:**
- Firebase Auth status (connected)
- Supabase status (connected)
- Webhook URLs for external systems
- API key management

**Backup & Maintenance:**
- Last backup timestamp
- Manual backup button
- Auto-backup schedule
- Data retention policy
```

### Screen 36: User Profile

```
Design a user profile/account settings page.

**Header:**
- User photo (large, editable)
- Name
- Email
- Role badge

**Profile Section:**
- Edit name, email
- Change photo
- Update password
  - Current password
  - New password
  - Confirm password
  - Password strength indicator

**Preferences:**
- Theme: Light / Dark / System
- Default view: Cards / Tables
- Items per page preference
- Email notification preferences

**Sessions:**
- Current session info
- "Sign out of all devices" option

**Danger Zone:**
- Delete account (if allowed)

**Recent Activity:**
- Login history
- Actions performed log
```

---

## MOBILE-SPECIFIC PROMPTS

### Mobile Dashboard

```
Design a mobile-responsive dashboard for AccessHub.

**Mobile Layout (< 640px):**

**Header:**
- Hamburger menu
- "AccessHub" logo
- Notification bell

**Quick Stats (2x2 grid):**
- Employees | Cards | Access Today | Denied

**Recent Activity Card:**
- Scrollable list
- Compact entries
- Pull to refresh

**Quick Actions (Bottom sheet or FAB):**
- Issue Card
- Add Employee
- View Logs

**Bottom Navigation:**
- Dashboard | Employees | Logs | Menu
```

### Mobile Employee List

```
Design a mobile employee list.

**Layout:**
- Search bar at top (sticky)
- Filter chips (scrollable horizontal)
- Card-based list (not table)

**Each Employee Card:**
- Photo (left)
- Name + Email
- Role badge
- Card status indicator (small icon)
- Chevron to details

**Pull to refresh**
**Infinite scroll**

**FAB:**
- + Add Employee
```

---

## Additional Component Prompts

### Empty States

```
Design empty state illustrations for:

1. No Employees: Person silhouette with + icon, "Add your first employee"
2. No Doors: Door outline, "Configure building doors"
3. No Organizations: Building with company flag, "Add tenant organization"
4. No Access Logs: Clock with checkmark, "No access attempts yet"
5. No Results: Magnifying glass, "No results match your search"
```

### Loading States

```
Design loading states:

1. Table skeleton: Rows with pulsing gray bars
2. Card skeleton: Card shape with pulsing content
3. Full page loader: AccessHub logo with circular progress
4. Inline loader: Small spinner with "Loading..."
```

### Error States

```
Design error states:

1. Connection Error: Cloud with X, "Unable to connect", Retry button
2. Not Found (404): Search icon with ?, "Page not found"
3. Permission Denied (403): Lock icon, "Access denied"
4. Server Error (500): Warning triangle, "Something went wrong", Contact support
```

---

## Summary

Total Screens: 36+ 
Components: 50+
Use these prompts sequentially with Stitch, starting with the design system prompt to establish consistency.
