# Project & Task Management API

A RESTful API for managing projects and tasks with JWT authentication, role-based access control, project membership, and audit logging.

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

| Variable              | Description                                               | Example          |
| --------------------- | --------------------------------------------------------- | ---------------- |
| PORT                  | Server port                                               | 3000             |
| NODE_ENV              | Environment                                               | development      |
| DB_HOST               | PostgreSQL host                                           | localhost        |
| DB_PORT               | PostgreSQL port                                           | 5432             |
| DB_USERNAME           | Database user                                             | app_user         |
| DB_PASSWORD           | Database password                                         | password         |
| DB_NAME               | Database name                                             | node_app         |
| DB_SUPERUSER          | Local PostgreSQL superuser (for `npm run setup` only)     | postgres         |
| DB_SUPERUSER_PASSWORD | Superuser password (leave empty if using peer/trust auth) | -                |
| REDIS_HOST            | Redis host                                                | localhost        |
| REDIS_PORT            | Redis port                                                | 6379             |
| JWT_SECRET            | JWT secret key                                            | your-secret-here |
| JWT_EXPIRES_IN        | Token expiration                                          | 24h              |

## Setup

### Quick Start (with Docker)

```bash
npm install
cp .env.example .env   # edit with your values
npm run docker:up
```

### Manual Setup

```bash
npm install
cp .env.example .env   # edit with your values
npm run setup          # creates DB, runs migrations, seeds, starts server
```

### Without Docker

```bash
# 1. Start PostgreSQL and Redis locally
# 2. Configure .env
# 3. Setup database + seed
npm run setup

# Or step by step:
npm run migration:run
npm run seed
npm run dev
```

## Default Seed Users

| Role   | Email           | Password  |
| ------ | --------------- | --------- |
| Admin  | admin@test.com  | admin123  |
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

This application is designed for deployment on [Railway](https://railway.app):

1. Push code to GitHub
2. Create a new Railway project
3. Add a PostgreSQL service (Railway managed Postgres)
4. Add a Redis service (Railway managed Redis)
5. Set environment variables in Railway dashboard
6. Deploy — Railway auto-detects Node.js and runs `npm run build && npm start`

Required Railway env vars:
```
PORT=3000
DB_HOST=<railway postgres host>
DB_PORT=5432
DB_USERNAME=<railway postgres user>
DB_PASSWORD=<railway postgres password>
DB_NAME=<railway postgres database>
REDIS_HOST=<railway redis host>
REDIS_PORT=6379
JWT_SECRET=<your-secret-key>
JWT_EXPIRES_IN=24h
NODE_ENV=production
```

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
