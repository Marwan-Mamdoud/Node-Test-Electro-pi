# Project & Task Management API

A RESTful API for managing projects and tasks with JWT authentication, role-based access control, project membership, and audit logging.

## Live

| Service | URL |
| --- | --- |
| Backend API | https://node-test-electro-pi-production.up.railway.app |
| Swagger Docs | https://node-test-electro-pi-production.up.railway.app/api-docs/ |
| Frontend | https://electro-test-sable.vercel.app/dashboard |
| Server Repo | https://github.com/Marwan-Mamdoud/Node-Test-Electro-pi |
| Frontend Repo | https://github.com/Marwan-Mamdoud/electro-test |

## Tech Stack

| Category       | Technology        |
| -------------- | ----------------- |
| Runtime        | Node.js 18+       |
| Framework      | Express.js 5      |
| Language       | TypeScript        |
| Database       | PostgreSQL        |
| ORM            | TypeORM           |
| Authentication | JWT + bcryptjs    |
| Validation     | express-validator |
| Cache          | Redis (ioredis)   |
| API Docs       | Swagger/OpenAPI   |
| Testing        | Jest + Supertest  |

## Features

- Authentication (register/login/logout) with JWT and Redis token blacklist
- Role-Based Access Control (ADMIN / MEMBER)
- Project management (CRUD) with membership-based access scoping
- Project membership management (add/remove members)
- Task management under projects (CRUD) with creator/assignee tracking
- Task filtering by status, priority, and assignee
- Text search on projects and tasks
- Pagination and sorting on all list endpoints
- Task audit logging (automatic status change tracking)
- Redis caching for read-heavy endpoints
- Health check endpoint
- Input validation on all endpoints
- Centralized error handling
- Full Swagger/OpenAPI documentation at `/api-docs`

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+

## Environment Variables

| Variable | Description | Local Default |
| --- | --- | --- |
| PORT | Server port (set automatically by Railway) | 3000 |
| NODE_ENV | `development` or `production` | development |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USERNAME | Database user | your_db_username |
| DB_PASSWORD | Database password (empty for local peer auth) | your_db_password |
| DB_NAME | Database name | node_app |
| DB_POOL_MAX | Max connections in pool | 10 |
| DB_SSL | Set `true` for Neon/remote PostgreSQL | false |
| DB_SUPERUSER | Local PostgreSQL superuser (for `npm run setup` only) | postgres |
| DB_SUPERUSER_PASSWORD | Superuser password (leave empty for peer/trust auth) | - |
| REDIS_HOST | Redis host (localhost in dev, 127.0.0.1 in container) | localhost |
| REDIS_PORT | Redis port | 6379 |
| JWT_SECRET | Secret key for signing JWTs | your_jwt_secret_here |
| JWT_EXPIRES_IN | Token expiry duration | 24h |
| FRONTEND_URL | Comma-separated CORS allowed origins | http://localhost:3001 |

> **Production (Railway):** `PORT` is set automatically — do not override it. `DB_SSL=true` is required for Neon.

## Setup

### Local Development

```bash
# 1. Clone and install
git clone https://github.com/Marwan-Mamdoud/Node-Test-Electro-pi.git
cd Node-Test-Electro-pi
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your local DB credentials

# 3. Start Redis (if not running)
redis-server --daemonize yes

# 4. Run migrations + start dev server
npm run migration:run
npm run dev
# Seeds run automatically on startup
```

### Test

```bash
npm test
# Expected: 4 suites, 51 tests passing
```

## Default Seed Users

Seeds run automatically on server start (`runSeeds()` in `server.ts`).

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@test.com | admin123 |
| Member | member@test.com | member123 |

## API Documentation

Swagger UI is available at:

```
http://localhost:3000/api-docs
```

The JSON spec is at `/api-docs.json`.

## API Endpoints

### Health

| Method | Endpoint    | Auth |
| ------ | ----------- | ---- |
| GET    | /api/health | No   |

### Auth

| Method | Endpoint           | Auth | Description          |
| ------ | ------------------ | ---- | -------------------- |
| POST   | /api/auth/register | No   | Register new user    |
| POST   | /api/auth/login    | No   | Login, get JWT token |
| POST   | /api/auth/logout   | Yes  | Logout, revoke token |
| GET    | /api/auth/me       | Yes  | Get current profile  |
| PUT    | /api/auth/me       | Yes  | Update profile       |
| PUT    | /api/auth/me/password | Yes | Change password   |

### Projects

| Method | Endpoint                          | Auth | Role        |
| ------ | --------------------------------- | ---- | ----------- |
| POST   | /api/projects                     | Yes  | Any         |
| GET    | /api/projects                     | Yes  | Any (scoped)|
| GET    | /api/projects/:id                 | Yes  | Any (scoped)|
| PUT    | /api/projects/:id                 | Yes  | Any (scoped)|
| DELETE | /api/projects/:id                 | Yes  | Any (scoped)|
| GET    | /api/projects/:id/members         | Yes  | Any (scoped)|
| POST   | /api/projects/:id/members         | Yes  | Admin       |
| DELETE | /api/projects/:id/members/:userId | Yes  | Admin       |

### Tasks (nested under projects)

| Method | Endpoint                                         | Auth | Role        |
| ------ | ------------------------------------------------ | ---- | ----------- |
| POST   | /api/projects/:projectId/tasks                  | Yes  | Any (scoped)|
| GET    | /api/projects/:projectId/tasks                  | Yes  | Any (scoped)|
| GET    | /api/projects/:projectId/tasks/:id              | Yes  | Any (scoped)|
| PUT    | /api/projects/:projectId/tasks/:id              | Yes  | Any (scoped)|
| DELETE | /api/projects/:projectId/tasks/:id              | Yes  | Creator/Admin|
| GET    | /api/projects/:projectId/tasks/:id/audit-log    | Yes  | Any (scoped)|

### Admin-only (under /api/auth)

| Method | Endpoint                | Auth | Role  |
| ------ | ----------------------- | ---- | ----- |
| GET    | /api/auth/users         | Yes  | Admin |
| GET    | /api/auth/users/:id     | Yes  | Admin |
| PUT    | /api/auth/users/:id     | Yes  | Admin |
| DELETE | /api/auth/users/:id     | Yes  | Admin |
| PATCH  | /api/auth/users/:id/role| Yes  | Admin |

## Query Parameters

### GET /api/projects

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| page      | number | Page number (default: 1)       |
| limit     | number | Items per page (default: 10)   |
| sortBy    | string | Sort field (default: createdAt)|
| sortOrder | string | asc or desc (default: desc)    |
| search    | string | Search by title/description    |

### GET /api/projects/:projectId/tasks

| Parameter | Type   | Values                         |
| --------- | ------ | ------------------------------ |
| status    | string | TODO, IN_PROGRESS, DONE        |
| priority  | string | low, medium, high              |
| assignee  | string | User ID                        |
| search    | string | Search by title/description    |
| page      | number | Page number                    |
| limit     | number | Items per page                 |
| sortBy    | string | title, priority, status, createdAt |
| sortOrder | string | asc or desc                    |

### Pagination Response Shape

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

## Authorization Rules

- **Global Admin** (`User.role === "admin"`): Can access all projects and tasks regardless of membership.
- **Member** (`User.role === "member"`): Can only access projects they own or are a member of (via ProjectMember).
- **Task delete**: Only the task creator or a global admin can delete tasks.
- **Project member management**: Only global admins can add/remove project members.

## Task Audit Logging

Every time a task's status changes, an entry is automatically written to `task_audit_logs` with:
- `taskId` — the task that changed
- `changedBy` — who made the change
- `oldStatus` / `newStatus` — the status transition
- `changedAt` — timestamp

View history: `GET /api/projects/:projectId/tasks/:taskId/audit-log`

## Scripts

| Command                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| npm run setup            | Create DB + migrate + seed + start (local no-Docker) |
| npm run dev              | Start dev server with hot reload                     |
| npm run build            | Compile TypeScript to dist/                          |
| npm run start            | Start production server from dist/                   |
| npm run test             | Run all tests (serial)                               |
| npm run test:watch       | Run tests in watch mode                              |
| npm run typecheck        | Type-check without emitting                          |
| npm run migration:run    | Run pending migrations                               |
| npm run migration:revert | Revert last migration                                |
| npm run seed             | Seed database with default data                      |
| npm run docker:up        | Build and start Docker containers                    |
| npm run docker:down      | Stop Docker containers                               |

## Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <token>
```

Tokens are obtained from `/api/auth/login`. Logged-out tokens are blacklisted in Redis.

## Response Format

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Success (paginated)

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

### Error

```json
{
  "success": false,
  "message": "Error message"
}
```

## Deployment (Railway)

### Production Architecture

| Component | Details |
| --- | --- |
| Platform | [Railway](https://railway.app) |
| Database | [Neon](https://neon.tech) (managed PostgreSQL, `DB_SSL=true`) |
| Redis | Self-hosted inside the container (ephemeral, no external service) |
| Backend | Express + TypeORM, built from multi-stage `Dockerfile` |
| Frontend | [Vercel](https://vercel.app) — https://electro-test-sable.vercel.app |

### How It Works

Railway detects the `Dockerfile` in the repo root and builds from it:

1. **Build stage:** `npm ci` + `npm run build` (TypeScript → dist/)
2. **Production stage:** installs `redis-server` on `node:20-slim`
3. **`start.sh`:** starts redis-server (localhost, daemonized) → waits for ping → `exec node dist/server.js`
4. **`ensureSchema()`:** auto-creates the `app` schema on startup (no superuser needed on Neon)

### Deploy Steps

1. Push code to GitHub
2. Create a new Railway project → connect the GitHub repo
3. Railway auto-builds from `Dockerfile` (no `railway.json` needed)
4. Set environment variables in Railway dashboard (see table above)
5. Deploy — Railway runs `start.sh` → redis-server → `node dist/server.js`
6. Verify: `GET /api/health` returns `{ "status": "healthy" }`
7. API docs: `GET /api-docs`

### Health Check

`GET /api/health` — reports database and Redis connectivity. The app is **healthy** as long as the database is reachable (Redis is optional infrastructure for caching). Swagger UI is at `/api-docs`.

## Architecture

```
Request -> Routes -> Middleware -> Controllers -> Services -> Repositories -> Database
```

- **Controllers** handle HTTP request/response
- **Services** contain business logic
- **Repositories** abstract database queries
- **Middleware** handles auth, validation, project access, and error handling

## Security

- bcryptjs password hashing (cost factor 10)
- JWT authentication with configurable expiry
- Redis token blacklist on logout
- Input validation on all endpoints via express-validator
- Role-based access control (admin/member)
- Per-project authorization (admin bypasses, member must be owner or in ProjectMember)
- Parameterized queries via TypeORM (SQL injection prevention)
- creatorId never accepted from client input (always derived from JWT session)
- assigneeId validated against project membership on write

## Performance

- Redis caching for read-heavy endpoints (projects, tasks)
- Pagination on all list endpoints
- Indexed foreign keys and frequently filtered columns
- Cache invalidation on writes
