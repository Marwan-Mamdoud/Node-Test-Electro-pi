# System Documentation — Electro Server

## 1. System Overview

### Tech Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **ORM:** TypeORM (migrations, no synchronize)
- **Database:** PostgreSQL (Neon in production, local in dev)
- **Cache/Sessions:** Redis via ioredis (in-container)
- **Auth:** bcryptjs + jsonwebtoken
- **Validation:** express-validator
- **Docs:** swagger-jsdoc + swagger-ui-express
- **Tests:** Jest + supertest

### Project Structure
```
src/
├── config/          # database.ts (TypeORM), redis.ts (ioredis)
├── controllers/     # Route handlers
├── middleware/       # auth.ts (authenticate/authorize), projectAuth.ts, validation.ts
├── models/          # TypeORM entities (User, Project, ProjectMember, Task, TaskAuditLog, RefreshToken)
├── repositories/    # Data access layer (user.repo, project.repo, projectMember.repo, task.repo)
├── routes/          # Express routers (auth, project, task, health)
├── services/        # Business logic
├── test/            # Jest integration tests
│   └── utils/       # testApp.ts, auth.helper.ts
├── validators/      # express-validator chains
├── migrations/      # TypeORM migration files
├── utils/           # jwt.ts (token generation/verification)
└── server.ts        # Entry point — ensureSchema() → AppDataSource.initialize() → app.listen()
```

### Database Schema
All tables live in the `app` schema (created automatically by `ensureSchema()` on startup).

### Roles
Two global roles stored on the User entity:
- **ADMIN** — full system access, bypasses all project membership checks
- **MEMBER** — default role, requires project membership to access projects/tasks

There are no per-project roles. `ProjectMember` is a simple join table (boolean membership).

---

## 2. Authentication

### Flow
1. `POST /api/auth/register` — creates user, returns JWT
2. `POST /api/auth/login` — validates credentials, returns JWT
3. Token sent as `Authorization: Bearer <token>` header
4. `POST /api/auth/logout` — blacklists token in Redis (TTL = remaining token expiry)

### JWT Payload
```json
{ "userId": "uuid", "role": "admin"|"member", "iat": ..., "exp": ... }
```

### Middleware
- **`authenticate`** (`src/middleware/auth.ts:9`) — verifies JWT, checks Redis blacklist, attaches `req.user = { userId, role }`
- **`authorize(...roles)`** (`src/middleware/auth.ts:39`) — checks `req.user.role` against allowed roles, returns 403 if not matched

---

## 3. Authorization Model

### Global Roles
| Role | Description |
|------|-------------|
| `admin` | Full system access. Bypasses all project membership checks. Can manage all users, projects, and tasks. |
| `member` | Default role. Must be added to a project's membership to access it. Can create/manage own tasks within accessible projects. |

### Project Access Control (`requireProjectAccess`)
Defined in `src/middleware/projectAuth.ts:11`. Applied to all task routes.

1. If `req.user.role === "admin"` → **allow** (bypass)
2. Check `ProjectMember` table — if user is a member → **allow**
3. Check `Project.ownerId` — if user is the owner → **allow**
4. Otherwise → **403 Forbidden**

### Task Delete Authorization
Task deletion is restricted in the service layer (`task.service.ts`), not middleware:
- **Admin** → always allowed
- **Task creator** → allowed
- **Anyone else** → 403

---

## 4. Data Models

### User
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| name | varchar(100) | Required |
| email | varchar(255) | Unique, indexed |
| password | text | bcrypt hashed |
| role | enum | `admin` \| `member`, default `member` |
| createdAt | timestamptz | Auto-generated |
| updatedAt | timestamptz | Auto-updated |

### Project
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| title | varchar(255) | Required |
| description | text | Nullable |
| status | enum | `active` \| `archived` \| `completed`, default `active` |
| ownerId | UUID (FK→User) | Indexed, CASCADE delete |
| createdAt | timestamptz | Auto-generated |
| updatedAt | timestamptz | Auto-updated |

### ProjectMember
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| projectId | UUID (FK→Project) | CASCADE delete |
| userId | UUID (FK→User) | CASCADE delete |
| createdAt | timestamptz | Auto-generated |

Unique constraint: `(projectId, userId)`

### Task
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| title | varchar(255) | Required |
| description | text | Nullable |
| status | enum | `TODO` \| `IN_PROGRESS` \| `DONE`, default `TODO` |
| priority | enum | `low` \| `medium` \| `high`, default `medium` |
| dueDate | date | Nullable, indexed |
| projectId | UUID (FK→Project) | Indexed, CASCADE delete |
| creatorId | UUID (FK→User) | NOT NULL, indexed, CASCADE delete |
| assigneeId | UUID (FK→User) | Nullable, indexed, SET NULL on delete |
| createdAt | timestamptz | Auto-generated |
| updatedAt | timestamptz | Auto-updated |

### TaskAuditLog
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| taskId | UUID (FK→Task) | Indexed, CASCADE delete |
| changedBy | UUID (FK→User) | CASCADE delete |
| oldStatus | enum | `TODO` \| `IN_PROGRESS` \| `DONE` |
| newStatus | enum | `TODO` \| `IN_PROGRESS` \| `DONE` |
| changedAt | timestamptz | Auto-generated |

Created automatically on every task status change.

---

## 5. Endpoints Reference

### Common Response Shapes

**Paginated:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Single resource:**
```json
{ "success": true, "data": { ... } }
```

**Error:**
```json
{ "message": "Error description" }
```

**Validation error:**
```json
{
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### Pagination & Sorting Query Params
Available on all list endpoints:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| sortBy | string | createdAt | Field to sort by |
| sortOrder | string | DESC | `ASC` or `DESC` |
| search | string | — | Full-text search (title/name/email) |

---

### 5.1 Health (1 endpoint)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | Returns DB + Redis connection status |

---

### 5.2 Auth — Public (2 endpoints)

#### POST /api/auth/register
Register a new user.

**Body:**
```json
{ "name": "string (2-100 chars)", "email": "string (valid email)", "password": "string (min 6 chars)" }
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "...", "email": "...", "role": "member" },
    "token": "jwt..."
  }
}
```

**Errors:** 409 (email already registered), 400 (validation)

#### POST /api/auth/login
Authenticate and receive JWT.

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "...", "email": "...", "role": "admin" },
    "token": "jwt..."
  }
}
```

**Errors:** 401 (invalid credentials)

---

### 5.3 Auth — Authenticated (4 endpoints)

#### POST /api/auth/logout
Blacklist current token.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{ "success": true, "message": "Logged out successfully" }
```

#### GET /api/auth/me
Get current user profile.

**Response 200:**
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "...", "email": "...", "role": "admin", "createdAt": "...", "updatedAt": "..." }
}
```

#### PUT /api/auth/me
Update own profile (name, email).

**Body:** `{ "name": "string (optional)", "email": "string (optional)" }`

**Response 200:** Updated user object.

**Errors:** 409 (email already in use), 400 (validation)

#### PUT /api/auth/me/password
Change own password.

**Body:** `{ "currentPassword": "string", "newPassword": "string (min 6, must have letter+number)" }`

**Response 200:**
```json
{ "success": true, "message": "Password updated successfully" }
```

**Errors:** 401 (current password incorrect), 400 (validation)

---

### 5.4 Auth — Admin Only (5 endpoints)

All endpoints below require `Authorization: Bearer <admin_token>`. Non-admin users receive 403.

#### GET /api/auth/users
List all users.

**Response 200:**
```json
{ "success": true, "data": [{ "id": "uuid", "name": "...", "email": "...", "role": "member", "createdAt": "...", "updatedAt": "..." }] }
```

#### GET /api/auth/users/:id
Get user by ID.

**Params:** `id` (UUID)

**Response 200:** User object.

**Errors:** 404 (not found)

#### DELETE /api/auth/users/:id
Delete a user.

**Params:** `id` (UUID)

**Response 200:**
```json
{ "success": true, "message": "User deleted successfully" }
```

**Errors:** 404 (not found)

#### PATCH /api/auth/users/:id/role
Update a user's role.

**Params:** `id` (UUID)
**Body:** `{ "role": "admin" | "member" }`

**Response 200:** Updated user object.

**Errors:** 404 (not found)

#### PUT /api/auth/users/:id
Admin update any user's profile (name, email, role).

**Params:** `id` (UUID)
**Body:** `{ "name": "string (optional)", "email": "string (optional)", "role": "string (optional)" }`

**Response 200:** Updated user object.

**Errors:** 409 (email already in use), 404 (not found)

---

### 5.5 Projects — Authenticated (5 endpoints)

All project endpoints require authentication. Non-admin members must be in the project's membership to access it.

#### POST /api/projects
Create a project (authenticated user becomes owner).

**Body:**
```json
{ "title": "string (1-255 chars)", "description": "string (optional, max 1000)", "status": "active|archived|completed (optional)" }
```

**Response 201:** Project object with `ownerId` set to authenticated user.

#### GET /api/projects
List projects accessible to the authenticated user.
- Admin: sees all projects
- Member: sees projects they own + projects they're a member of

**Query params:** page, limit, sortBy, sortOrder, search

**Response 200:** Paginated `{ data: [...], meta: { ... } }`

#### GET /api/projects/:id
Get a single project.

**Params:** `id` (UUID)

**Response 200:** Project object.

**Errors:** 403 (not a member/not owner), 404 (not found for non-admin)

#### PUT /api/projects/:id
Update a project (owner or admin only).

**Params:** `id` (UUID)
**Body:** `{ "title": "...", "description": "...", "status": "..." }` (all optional)

**Response 200:** Updated project.

#### DELETE /api/projects/:id
Delete a project (owner or admin only).

**Params:** `id` (UUID)

**Response 200:** `{ "success": true, "message": "Project deleted successfully" }`

---

### 5.6 Projects — Members (3 endpoints)

#### GET /api/projects/:id/members
List members of a project.

**Params:** `id` (UUID, project ID)

**Response 200:** `{ "success": true, "data": [{ "userId": "uuid", "name": "...", "email": "..." }] }`

#### POST /api/projects/:id/members
Add a member to a project (project owner or admin only). Accepts either `userId` or `email` — exactly one must be provided.

**Params:** `id` (UUID, project ID)

**Body (option A):**
```json
{ "userId": "uuid" }
```

**Body (option B):**
```json
{ "email": "user@example.com" }
```

**Response 201:** `{ "success": true, "data": { "id": "uuid", "projectId": "uuid", "userId": "uuid", "createdAt": "..." } }`

**Errors:** 400 (both or neither provided, validation), 404 (user not found / no user with that email), 409 (user already a member)

#### DELETE /api/projects/:id/members/:userId
Remove a member from a project (project owner or admin only).

**Params:** `id` (UUID, project ID), `userId` (UUID, member to remove)

**Response 200:** `{ "success": true, "message": "Member removed successfully" }`

---

### 5.7 Projects — Admin Only (4 endpoints)

Requires admin role. Admin can manage all projects regardless of membership.

#### GET /api/projects/admin/projects
List all projects (admin scope). Supports pagination, search, sort.

**Response 200:** Paginated projects.

#### GET /api/projects/admin/projects/:id
Get any project by ID (admin scope).

**Response 200:** Project object.

#### PUT /api/projects/admin/projects/:id
Update any project (admin scope).

**Body:** `{ "title": "...", "description": "...", "status": "..." }` (all optional)

**Response 200:** Updated project.

#### DELETE /api/projects/admin/projects/:id
Delete any project (admin scope).

**Response 200:** `{ "success": true, "message": "Project deleted successfully" }`

---

### 5.8 Tasks — Project-Scoped (5 endpoints)

All task routes are nested under `/api/projects/:projectId/tasks`. Access requires authentication + project membership (or admin bypass).

#### POST /api/projects/:projectId/tasks
Create a task in a project.

**Params:** `projectId` (UUID)

**Body:**
```json
{
  "title": "string (1-255 chars, required)",
  "description": "string (optional, max 1000)",
  "status": "TODO|IN_PROGRESS|DONE (optional, default TODO)",
  "priority": "low|medium|high (optional, default medium)",
  "dueDate": "ISO 8601 date (optional)",
  "assigneeId": "UUID (optional, must be project member)"
}
```

**Note:** `creatorId` is automatically set from the authenticated user. If provided in the body, the request is rejected with 400.

**Response 201:** Task object with `creatorId` set.

**Errors:** 400 (assignee not a project member, validation), 403 (no project access)

#### GET /api/projects/:projectId/tasks
List tasks for a project.

**Query params:** page, limit, sortBy, sortOrder, status, priority, assignee, search

**Response 200:** Paginated tasks.

#### GET /api/projects/:projectId/tasks/:id
Get a single task.

**Response 200:** Task object with `creator` and `assignee` relations.

#### PUT /api/projects/:projectId/tasks/:id
Update a task. Status changes are automatically logged to the audit log.

**Body:**
```json
{
  "title": "...",
  "description": "...",
  "status": "TODO|IN_PROGRESS|DONE",
  "priority": "low|medium|high",
  "dueDate": "ISO 8601 date",
  "assigneeId": "UUID (must be project member)"
}
```

**Response 200:** Updated task.

#### DELETE /api/projects/:projectId/tasks/:id
Delete a task. Only the task creator or an admin can delete.

**Response 200:** `{ "success": true, "message": "Task deleted successfully" }`

**Errors:** 403 (not creator, not admin)

---

### 5.9 Tasks — Audit Log (1 endpoint)

#### GET /api/projects/:projectId/tasks/:id/audit-log
Get status change history for a task. Requires project access.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "taskId": "uuid",
      "changedBy": "uuid",
      "oldStatus": "TODO",
      "newStatus": "IN_PROGRESS",
      "changedAt": "2026-06-25T10:00:00.000Z"
    }
  ]
}
```

---

### 5.10 Tasks — Admin Only (4 endpoints)

Admin can manage all tasks across all projects, bypassing membership checks.

#### GET /api/projects/:projectId/tasks/admin/tasks
List all tasks (admin scope). `:projectId` is in the URL but admin sees tasks from all projects.

**Query params:** page, limit, sortBy, sortOrder, status, priority, assignee, search

**Response 200:** Paginated tasks.

#### GET /api/projects/:projectId/tasks/admin/tasks/:id
Get any task (admin scope).

**Response 200:** Task object.

#### PUT /api/projects/:projectId/tasks/admin/tasks/:id
Update any task (admin scope).

**Response 200:** Updated task.

#### DELETE /api/projects/:projectId/tasks/admin/tasks/:id
Delete any task (admin scope).

**Response 200:** `{ "success": true, "message": "Task deleted successfully" }`

---

## 6. Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3000 | Server port |
| DB_HOST | Yes | localhost | PostgreSQL host |
| DB_PORT | Yes | 5432 | PostgreSQL port |
| DB_USERNAME | Yes | — | Database user |
| DB_PASSWORD | Yes* | — | Database password (*empty for local peer auth) |
| DB_NAME | Yes | node_app | Database name |
| DB_POOL_MAX | No | 10 | Max connections in pool |
| DB_SSL | No | false | Set `true` for Neon/remote PostgreSQL |
| REDIS_HOST | No | localhost | Redis host |
| REDIS_PORT | No | 6379 | Redis port |
| JWT_SECRET | Yes | — | Secret for signing JWTs |
| JWT_EXPIRES_IN | No | 24h | Token expiry (e.g. 24h, 7d) |
| FRONTEND_URL | No | http://localhost:3001 | Comma-separated CORS allowed origins |
| NODE_ENV | No | development | `development` or `production` |

### Local Development Setup
```bash
# 1. Create .env from template
cp .env.example .env
# Edit DB_USERNAME, DB_NAME to match your local PostgreSQL

# 2. Install dependencies
npm install

# 3. Start Redis (if not running)
redis-server --daemonize yes

# 4. Run migrations and start dev
npm run dev
```

### Production (Railway + Neon)
- **Live:** https://node-test-electro-pi-production.up.railway.app
- **Swagger:** https://node-test-electro-pi-production.up.railway.app/api-docs/
- Railway auto-detects the `Dockerfile` and builds from it (no `railway.json` needed)
- `DB_SSL=true` — Neon requires SSL connections
- Redis runs in-container via `start.sh` (redis-server daemonized)
- `ensureSchema()` auto-creates the `app` schema on startup (no superuser needed)
- `PORT` is set automatically by Railway — do not override it
- Set environment variables via Railway dashboard (Variables tab)
- Health check: `GET /api/health` — reports `healthy` if database is reachable (Redis is optional)

### Deploying to Railway
1. Connect your GitHub repo ([Node-Test-Electro-pi](https://github.com/Marwan-Mamdoud/Node-Test-Electro-pi)) to Railway
2. Railway auto-builds from `Dockerfile` in the repo root
3. Set environment variables in the Railway dashboard (see §6)
4. Deploy — Railway runs `start.sh` → redis-server starts → `node dist/server.js`
5. Verify: `GET /api/health` returns `{ "status": "healthy" }`
6. API docs: https://node-test-electro-pi-production.up.railway.app/api-docs/

---

## 7. Frontend Implementation Notes

### Base URLs

| Environment | Backend Base URL | Frontend URL |
| --- | --- | --- |
| Local | `http://localhost:3000` | `http://localhost:3001` |
| Production | `https://node-test-electro-pi-production.up.railway.app` | `https://electro-test-sable.vercel.app` |

### Auth Flow
The API returns the JWT in the response body (on `/register` and `/login`). The backend does **not** set any cookies. The frontend is responsible for storing the token and attaching it to requests.

Recommended approach:
1. Store the JWT in memory (e.g. a variable or React context) — avoid `localStorage` for XSS safety
2. Use an axios/fetch interceptor to attach `Authorization: Bearer <token>` to all requests
3. On 401 response, clear the token and redirect to login
4. On logout, call `POST /api/auth/logout` then clear the in-memory token

### Role-Based UI
```typescript
const { role } = await fetch("/api/auth/me", { headers }).then(r => r.json());
// role === "admin" → show admin panel, user management, all projects
// role === "member" → show accessible projects only
```

### Pagination
```typescript
const res = await fetch("/api/projects?page=1&limit=10&sortBy=createdAt&sortOrder=DESC");
const { data, meta } = await res.json();
// meta.totalPages → total pages
// meta.total → total items
```

### Task Filtering
```typescript
const res = await fetch(
  `/api/projects/${projectId}/tasks?status=TODO&priority=high&assignee=${userId}&search=bug`
);
```

### Project Membership
```typescript
// Add member (owner or admin)
await fetch(`/api/projects/${projectId}/members`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId: "member-uuid" }),
});

// Remove member
await fetch(`/api/projects/${projectId}/members/${userId}`, { method: "DELETE" });
```

### Key Conventions
- All list endpoints return `{ data: [...], meta: { total, page, limit, totalPages } }`
- All single-resource endpoints return `{ success: true, data: {...} }`
- All message-only success responses (deletes, logout, password change) return `{ success: true, "message": "..." }`
- Errors return `{ message: "..." }` with appropriate HTTP status
- Task status values are UPPERCASE: `TODO`, `IN_PROGRESS`, `DONE`
- Task priority values are lowercase: `low`, `medium`, `high`
- Project status values are lowercase: `active`, `archived`, `completed`
- All IDs are UUIDs
- Timestamps are ISO 8601 (`timestamptz`)
