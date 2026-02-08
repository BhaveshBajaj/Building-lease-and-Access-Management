# Architecture: Building Access Control System

> A physical access control backend that decides, in real-time, whether an RFID card swipe should unlock a door — factoring in card validity, employee status, role-based permissions, door group membership, building timezone, and time-bound access windows.

---

## 0. Engineering Goals (What This System Optimizes For)

This system is designed around quality attributes that matter for **physical security** and **operational reliability**.

### 0.1 Quality Attributes

- **Fail-secure correctness**: unknown states deny access (never “fail open”).
- **Low-latency decisioning**: verification is optimized for fast *deny/allow* decisions under bursty traffic.
- **Auditability**: every attempt is recorded with a concrete denial reason.
- **Scalability by data lifecycle**: access logs grow unbounded; partitioning enables predictable query cost and retention.
- **Operational clarity**: errors are classified (operational vs programmer) and exposed safely.

### 0.2 Explicit (Portfolio) SLO Targets

These are not “promises” — they’re the target envelopes the design is built to support:

- **Access verification latency**: P95 < 100ms, P99 < 250ms under expected peak.
- **Access verification availability**: 99.9% (the system is a critical path for humans).
- **Audit log durability**: best-effort write on every request; never blocks the decision response.

### 0.3 Principles That Drive Design Choices

- **Bounded complexity** over premature distribution: single deployable, strong internal boundaries.
- **Make invalid states unrepresentable** where it matters (DB constraints/triggers), and human-friendly where it matters (service invariants/errors).
- **Design for incident response**: denial reason granularity, structured logs, and predictable failure behavior.

## 1. The Core Problem & Why It's Non-Trivial

This isn't a CRUD app with auth bolted on. The system solves a **real-time physical security decision** — when a card reader sends `{ card_uid, door_id }`, the backend must return `GRANTED` or `DENIED` within milliseconds while evaluating a **6-step verification chain** where any step can short-circuit the entire request.

The challenge: the permission model isn't a simple user→resource mapping. It's a **multi-hop graph traversal**:

```
Card → Employee → Role → Permission → Door Group → Door
                                            ↑
                                    Time Window Check
                                    (building timezone)
```

Each node in this chain has its own validity state (`ACTIVE`, `INACTIVE`, `LOST`, `BLOCKED`), and the system must evaluate all of them before granting access. A single broken link in the chain means denial — and the system must record *exactly which link broke* for audit.

---

## 2. Data Model: Why These Tables Exist This Way

### 2.1 The Door Group Abstraction

The naive approach would be to directly assign permissions as `Role → Door`. This falls apart immediately at scale:

- Building has 200 doors. New role gets added. You'd need 200 permission rows.
- A door gets reclassified from "public" to "restricted." You'd need to update every role's permissions individually.

Instead, the system introduces a **Door Group** as an indirection layer:

```
Role ──→ Door Group ──→ Door
         (PUBLIC)       (Main Entrance, Cafeteria, Stairwell)
         (PRIVATE)      (Suite 101, Suite 102)
         (RESTRICTED)   (Server Room, Security Office)
```

The many-to-many junction table `door_door_group` allows a single door to belong to multiple groups (a server room door could be both RESTRICTED and PRIVATE). Permissions are assigned at the group level, not the door level. This means:

- Adding a new door to the system = assign it to existing groups. Zero permission changes needed.
- Changing a door's classification = move it between groups. All role permissions update implicitly.
- Adding a new role = assign it to relevant groups. Instantly applies to every door in those groups.

This is **O(groups)** permission management instead of **O(doors × roles)**.

### 2.2 System Roles vs. Organization Roles

The role table (`access_role`) has a `is_system_role` boolean and a nullable `organization_id`. This is deliberate:

- **System roles** (Employee, Manager, IT Admin) have `organization_id = NULL` and `is_system_role = true`. They're global templates available to all organizations.
- **Organization roles** have a specific `organization_id` and `is_system_role = false`. They exist within the scope of one tenant.

The uniqueness constraint is `UNIQUE(name, organization_id)`, which means:
- Two organizations can both have a "Contractor" role without collision.
- A system-level "Employee" role and an org-level "Employee" role can coexist (different `organization_id` values).

The service layer enforces the invariant: system roles cannot have an `organization_id`, and org roles must have one. This validation happens in the **service layer, not the database** — because the error message needs to be human-readable, not a raw constraint violation.

### 2.3 Access Logs: Partitioned by Month

The `access_log` table uses **PostgreSQL native range partitioning** by `timestamp`:

```sql
CREATE TABLE access_log (
  id BIGSERIAL,
  card_uid VARCHAR(100) NOT NULL,
  door_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL,
  denial_reason TEXT,
  PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);
```

Why partition instead of just indexing?

- A building with 500 employees swiping 4 times/day = **~60,000 rows/month**. After a year, that's 720K rows. After 3 years with multiple buildings, you're in the millions.
- Queries like "show me all denied attempts this week" only scan the current month's partition, not the entire table history.
- Old partitions can be archived or dropped without touching active data. `DROP TABLE access_log_2026_01` is instant; `DELETE FROM access_log WHERE timestamp < '2026-02-01'` is a full table scan with vacuum overhead.

The composite primary key `(id, timestamp)` is required by PostgreSQL — partition keys must be part of the primary key.

The indexes are designed for the actual query patterns:

```sql
-- "Show me this card's recent access history" (card detail page)
CREATE INDEX idx_access_log_card_uid ON access_log(card_uid, timestamp DESC);

-- "Show me who accessed this door" (door activity page)
CREATE INDEX idx_access_log_door ON access_log(door_id, timestamp DESC);

-- "Show me all denied attempts" (security dashboard) — partial index
CREATE INDEX idx_access_log_status ON access_log(status, timestamp DESC) WHERE status = 'DENIED';
```

The partial index on `status = 'DENIED'` is the important one. In a healthy system, 95%+ of attempts are `GRANTED`. Security teams care about the 5% that were denied. A partial index means the DENIED index is ~20x smaller than a full status index, which means faster scans and less memory usage.

### 2.4 The Lease → Employee → Card Cascade

When an organization's lease expires, the system needs to cascade the effect:

```
Lease expires → Organization's employees should lose access → Their cards should be deactivated
```

This is handled at two levels:

1. **Database trigger** — When an employee's status changes to `INACTIVE`, a trigger automatically sets their card to `INACTIVE`:

```sql
CREATE OR REPLACE FUNCTION deactivate_card_on_employee_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'INACTIVE' AND OLD.status = 'ACTIVE' THEN
    UPDATE access_card SET status = 'INACTIVE'
    WHERE employee_id = NEW.id AND status = 'ACTIVE';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

2. **Scheduled script** (`scripts/deactivateExpiredLeases.js`) — Finds all expired leases, collects the affected organizations, finds their active employees, and bulk-deactivates cards. This is designed to be run as a **cron job**, not as a real-time check, because lease expiration is a daily event — not something that needs millisecond precision.

The trigger handles the **individual employee deactivation** case (HR removes someone). The script handles the **bulk lease expiration** case (entire organization loses access). Two different mechanisms for two different operational patterns.

---

## 3. The 6-Step Access Verification Pipeline

This is the most critical code path in the system. It's in `AccessVerificationService.verifyAccess()` and it's deliberately written as a **linear pipeline, not a parallel one**.

```
Step 1: Card lookup + status check
Step 2: Employee lookup + status check
Step 3: Role existence check
Step 4: Door lookup + door group resolution
Step 5: Permission check (role × door groups)
Step 6: Time restriction evaluation (building timezone)
```

### Why Sequential, Not Parallel?

The intuition says "query card, employee, door, and permissions in parallel for speed." But that's wrong here:

- If the card doesn't exist (Step 1 fails), there's no employee to look up. Running Steps 2-6 would be wasted database calls.
- Each step is a **gate**. ~40% of denials are caught at Steps 1-2 (invalid card or inactive employee). Running all 6 queries for every request wastes database connections for a result that was determined in Step 1.
- The denial reason must be **specific**. "Card not found" vs "Employee inactive" vs "Outside permitted time range" — these are different security events with different response protocols.

### Time-Bound Access: Timezone-Aware Evaluation

Step 6 is where it gets interesting. Permissions can be `ALWAYS` (24/7 access) or `TIME_BOUND` (e.g., 09:00–17:00). Time-bound access is evaluated against the **building's timezone**, not UTC, not the server's timezone:

```javascript
static isWithinTimeRange(buildingTimezone, startTime, endTime) {
  const now = dayjs().tz(buildingTimezone);
  const currentTime = now.format('HH:mm:ss');

  // Handle overnight ranges (e.g., 22:00 to 06:00 for night shift)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }

  return currentTime >= startTime && currentTime <= endTime;
}
```

The overnight range handling (`startTime > endTime`) is subtle but critical. A night-shift permission from 22:00 to 06:00 means "from 10 PM today to 6 AM tomorrow." The simple `>=` and `<=` check would fail because 22:00 > 06:00. The `||` operator handles the wraparound: current time is valid if it's after 22:00 (today) OR before 06:00 (tomorrow).

### Fault Tolerance in the Verification Path

The verification endpoint is designed to **never throw an unhandled error to the card reader**:

```javascript
} catch (error) {
  logger.error('Access verification error:', error);
  denialReason = 'System error during verification';

  // Still log the attempt even on error
  try {
    await this.logAccess(cardUid, doorId, 'DENIED', denialReason);
  } catch (logError) {
    logger.error('Failed to log access attempt:', logError);
  }

  return { status: 'DENIED', message: 'System error', timestamp };
}
```

Key decisions:
- System errors default to `DENIED`, not `GRANTED`. A database outage should lock doors, not open them. **Fail-secure, not fail-open.**
- Logging failure doesn't block the access decision. The nested try-catch ensures that even if the audit log write fails, the card reader still gets a response.
- The card reader never sees internal error details. It gets `"System error"`, not a stack trace.

---

## 4. Layered Architecture: Why Each Layer Exists

```
Routes → Controllers → Services → Repositories → Supabase/PostgreSQL
```

This isn't "layers for the sake of layers." Each layer has a specific responsibility boundary:

### Routes Layer
Owns: HTTP verb mapping, request validation schemas, middleware composition.

```javascript
router.post('/verify', [
  body('card_uid').trim().notEmpty(),
  body('door_id').isUUID(),
  validate
], accessController.verifyAccess);
```

Validation happens here, not in the service, because validation is an HTTP concern. The service doesn't know or care about HTTP — it receives already-validated data.

### Controller Layer
Owns: HTTP request/response shaping. Nothing else.

Controllers are thin. They extract data from `req`, call a service, and format the response through `ApiResponse`. No business logic lives here. If you see an `if` statement in a controller, something is wrong.

### Service Layer
Owns: Business rules, cross-entity orchestration, invariant enforcement.

This is where decisions happen: "Can this employee get a card?" requires checking employee status, existing card existence, and employee-organization relationship. The service coordinates across multiple repositories to enforce rules that no single repository can enforce alone.

### Repository Layer
Owns: Data access patterns, query construction, Supabase-specific logic.

Repositories never throw business errors — they throw `NotFoundError` or database errors. They don't validate business rules. They translate between the application's data needs and Supabase's query API.

Example: the `findByUid` method in `CardRepository` joins across 3 levels (`card → employee → role`) because the access verification pipeline needs all that data in one round trip:

```javascript
const { data } = await supabase
  .from('access_card')
  .select(`*, employee:employee_id(
    id, name, email, status, organization_id,
    role:role_id(id, name, is_system_role, organization_id)
  )`)
  .eq('card_uid', cardUid)
  .single();
```

This is a deliberate **N+1 prevention**. Instead of fetching the card, then fetching the employee, then fetching the role in 3 separate queries, the nested select resolves it in one database call.

---

## 5. Security Decisions

### 5.1 Authentication Architecture

The system uses **Firebase for authentication, Supabase for data** — and these are deliberately decoupled.

Firebase handles identity (who are you?). Supabase handles authorization (what can you do?). The middleware verifies Firebase tokens and attaches `{ uid, email, emailVerified }` to the request. The admin check is against a server-side email allowlist in environment variables — not Firebase custom claims.

Why not Firebase custom claims for admin? Because claims require a Firebase Admin SDK call to set, and if the claims get out of sync, you'd need to force-refresh tokens. The email allowlist is simpler, immediately updatable without token refresh, and auditable in the deployment config.

### 5.2 The Unauthenticated Endpoint

`POST /api/v1/access/verify` has **no authentication middleware**. This is intentional and correct.

Card readers are embedded hardware devices. They don't have Firebase tokens. They send a card UID and door ID. The endpoint is effectively a machine-to-machine API.

To compensate for the lack of auth:
- Rate limiting is applied to all API routes, but `/verify` is **excluded from the general limiter** and instead uses a **dedicated high-ceiling limiter** (to tolerate rush-hour bursts while still providing DoS resistance).
- The response is deliberately minimal — it returns `GRANTED`/`DENIED` and a timestamp, never internal IDs or employee details to the card reader in denial cases.
- Every single attempt (including failures) is logged to the access log with denial reasons.

What a senior reviewer should notice here is the explicit tension:

- If you rate-limit too aggressively, you create a safety incident (people locked out).
- If you don’t rate-limit at all, you create a security incident (trivial DoS).

The chosen design is to **separate** traffic classes (human/admin APIs vs machine verification) and apply different ceilings.

Additional hardening options (deliberately deferred to avoid operational overhead in an MVP) include:

- IP allowlisting (if readers egress from known NATs)
- Mutual TLS or a per-door shared secret (HMAC over payload)
- Network segmentation (place readers on a controlled VLAN)

### 5.3 Error Information Leakage

The error handler switches behavior based on environment:

```javascript
if (env.NODE_ENV === 'development') {
  // Full error details + stack trace
}

if (err.isOperational) {
  // Known error: show message (e.g., "Role not found")
}

// Unknown error: generic "Something went wrong"
```

The `isOperational` flag on the custom `AppError` class distinguishes between errors we threw intentionally (validation failures, not-found) and unexpected errors (database connection dropped, null pointer). Operational errors are safe to show to users. Programming errors never are.

---

## 6. Infrastructure Patterns

### 6.1 Singleton Initialization

Both Supabase and Firebase clients use the **singleton pattern with constructor caching**:

```javascript
class SupabaseClient {
  constructor() {
    if (!SupabaseClient.instance) {
      this.client = createClient(/* ... */);
      SupabaseClient.instance = this;
    }
    return SupabaseClient.instance;
  }
}
```

This matters because both clients hold connection pools and auth state. Creating multiple instances would mean multiple connection pools competing for the same database connections, and multiple Firebase auth initializations (which Firebase explicitly errors on).

### 6.2 Environment Validation at Boot

The application validates **all** environment variables at startup using Joi schema validation — before any server code runs:

```javascript
const envSchema = Joi.object({
  SUPABASE_URL: Joi.string().uri().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().email().required(),
  // ...
}).unknown();

const { error } = envSchema.validate(process.env);
if (error) throw new Error(`Environment validation error: ${error.message}`);
```

If `SUPABASE_URL` is missing, the app crashes immediately with a clear error message — not 30 minutes later when the first database query fails with a cryptic "invalid URL" error. **Fail fast at boot, not at runtime.**

### 6.3 Graceful Shutdown

The server handles `SIGTERM`, `SIGINT`, uncaught exceptions, and unhandled promise rejections — each with specific behavior:

- `SIGTERM`/`SIGINT`: Close the HTTP server gracefully (finish in-flight requests), then exit.
- Uncaught exceptions: Log and crash immediately (the process state is corrupt).
- Unhandled rejections: Log, close the server, then exit (the promise chain is broken but the process might be salvageable for in-flight requests).

This matters in containerized deployments. Kubernetes sends `SIGTERM` before killing a pod. If the app doesn't handle it, in-flight requests get dropped.

### 6.4 Structured Logging

Winston is configured with JSON formatting in production and human-readable output in development:

```javascript
defaultMeta: { service: 'access-control-api' },
transports: [
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' })
]
```

The `service` default meta tag means when this service's logs are aggregated with other services in a log management system (ELK, Datadog), they're immediately filterable. The request logger captures method, path, status code, duration, IP, and user agent — enough to reconstruct request patterns without needing to add more instrumentation.

---

## 7. What's Deliberately Not Here (And Why)

| Missing Feature | Why It's Intentionally Absent |
|---|---|
| **WebSocket for real-time door status** | Card readers are fire-and-forget HTTP devices. They don't maintain persistent connections. WebSocket would add complexity with zero consumers. |
| **Caching layer (Redis)** | The access verification query chain is 3-4 Supabase calls total. At the current scale, adding Redis would mean cache invalidation complexity (when a card is blocked, the cache must be invalidated immediately — stale cache = security breach). The correctness risk outweighs the latency gain. |
| **JWT-based API keys for card readers** | Card readers are on a private network segment. Adding API key management for embedded devices adds operational burden (key rotation, revocation) without meaningful security improvement over network isolation. |
| **Microservice decomposition** | There's one deployment unit, one database, one team. Splitting into services would add network latency to the verification path, require distributed tracing, and create operational overhead — all for an organizational boundary that doesn't exist. |
| **GraphQL** | The API consumers are a single frontend and card readers. The data shapes are known and fixed. GraphQL's flexibility is unnecessary here and would make the card reader integration more complex. |

---

## 8. Threat Model (Minimal but Explicit)

The system’s attack surface is split into two classes: (1) human/admin APIs protected by Firebase auth, and (2) the unauthenticated verification endpoint.

### 10.1 Primary Risks

- **DoS against `/access/verify`**: attempts to exhaust CPU/DB connections.
- **Credential stuffing / token abuse**: against admin endpoints.
- **Privilege escalation**: misconfigured role/door-group permissions.
- **Audit log tampering**: attempts to hide traces after a security incident.
- **Time-based bypass**: timezone mistakes or overnight range bugs.

### 10.2 Mitigations Present in the Build

- **Backpressure**: rate limiting with a dedicated ceiling for verification traffic.
- **Fail-secure default**: unexpected errors result in `DENIED`.
- **Least disclosure**: card readers get minimal response shape.
- **DB constraints/triggers**: prevent double cards per employee, enforce valid states, and cascade deactivation.
- **Partitioned audit log**: supports fast security queries and retention management.

### 10.3 Hardening Roadmap (If This Were a Team Production System)

- Move verification endpoint behind an internal gateway or reader network.
- Add correlation IDs for end-to-end traceability (`X-Request-Id`).
- Consider Supabase RLS + scoped JWTs for tenant-safe data access patterns (currently the API uses service credentials for server-side access).

---

## 9. Schema Relationship Map

```
┌─────────────┐     ┌──────────┐     ┌──────────────┐
│  building    │────→│  floor   │────→│ office_space  │
│  (timezone)  │  1:N│          │  1:N│               │
└─────────────┘     └──────────┘     └───────┬───────┘
                                             │ 1:N
                                     ┌───────▼───────┐
                                     │    lease       │
                                     │ (start, end)   │
                                     └───────┬───────┘
                                             │ N:1
┌──────────────┐                     ┌───────▼───────┐
│ access_role  │←────────────────────│ organization  │
│(system/org)  │  1:N                └───────┬───────┘
└──────┬───────┘                             │ 1:N
       │                             ┌───────▼───────┐
       │ 1:N                         │   employee    │
       ├────────────────────────────→│  (status)     │
       │                             └───────┬───────┘
       │                                     │ 1:1
       │                             ┌───────▼───────┐
       │                             │ access_card   │
       │                             │ (card_uid,    │
       │                             │  status)      │
       │                             └───────────────┘
       │
       │         ┌─────────────────────────┐
       │    N:M  │ role_door_group_permission│
       └────────→│ (access_type,            │
                 │  start_time, end_time)    │
                 └────────────┬─────────────┘
                              │ N:1
                 ┌────────────▼─────────────┐
                 │       door_group         │     N:M      ┌────────┐
                 │ (PUBLIC/PRIVATE/         │──────────────→│  door  │
                 │  RESTRICTED)            │ door_door_group│        │
                 └──────────────────────────┘               └────────┘
```

---

## 10. What a Request Looks Like End-to-End

**Scenario**: Employee swipes card at server room door at 2 AM.

```
1. Card reader sends POST /api/v1/access/verify
   { card_uid: "CARD-0042", door_id: "uuid-server-room" }

2. Express middleware chain:
   helmet() → cors() → json() → compression() → requestLogger()
   (No auth middleware — card reader endpoint)

3. Route validation: card_uid is non-empty, door_id is valid UUID ✓

4. AccessVerificationService.verifyAccess():
   Step 1: SELECT from access_card WHERE card_uid = 'CARD-0042'
           → Card found, status = ACTIVE ✓
           → Employee joined: { name: "Bob", status: "ACTIVE", role: { name: "Manager" } }

   Step 2: Employee status = ACTIVE ✓

   Step 3: Role exists = "Manager" ✓

   Step 4: SELECT from door WHERE id = 'uuid-server-room'
           → Door found, groups = [{ type: "RESTRICTED" }]
           → Building timezone = "America/New_York"

   Step 5: SELECT from role_door_group_permission
           WHERE role_id = manager_role AND door_group_id IN (restricted_group)
           → No permission found for Manager → RESTRICTED group

   Step 6: Never reached — denied at Step 5

   Result: { status: "DENIED", message: "No permission for this door" }

5. Access log written: card_uid, door_id, DENIED, "No permission for this door"

6. Response sent to card reader: { status: "DENIED", ... }
   Total time: ~50ms
```

If Bob were an IT Admin, Step 5 would find a permission. If that permission were `TIME_BOUND` (09:00–18:00) and it's 2 AM in New York, Step 6 would deny with "Outside permitted time range."

---

*This document reflects the system as built. Decisions were made for a single-building MVP with clear extension points (multi-building, RLS-based multi-tenancy, real-time event streaming) that can be added without restructuring the core verification pipeline.*
