# Project & Task Management API

A RESTful API for managing projects and tasks with JWT authentication, built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

---

## Tech Stack

| Category       | Technology        |
| -------------- | ----------------- |
| Runtime        | Node.js 18+       |
| Framework      | Express.js        |
| Language       | TypeScript        |
| Database       | PostgreSQL        |
| ORM            | TypeORM           |
| Authentication | JWT               |
| Validation     | express-validator |
| Cache          | Redis             |
| API Docs       | Swagger/OpenAPI   |
| Testing        | Jest + Supertest  |

---

## Features

- Authentication (register/login/logout) with JWT
- Project management (CRUD)
- Task management under projects (CRUD)
- Filtering tasks by status and priority
- Pagination for list endpoints
- Role-Based Access Control (admin/member)
- Redis caching for read optimization
- Health check endpoint
- Input validation on all endpoints
- Centralized error handling

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+

---

## Project Structure

```
src/
├── config/           # DB + Redis config
├── controllers/      # HTTP handlers
├── middleware/       # Auth, validation, error handling
├── models/           # TypeORM entities
├── repositories/     # DB access layer
├── routes/           # API routes
├── services/         # Business logic
├── validators/       # Request validation
├── utils/            # JWT + helpers
├── database/
│   ├── migrations/   # TypeORM migrations
│   └── seeds/        # Seed data
└── test/             # Jest test suites
```

---

## Environment Setup

### 1. Clone repository

```bash
git clone https://github.com/Marwan-Mamdoud/Node-Test-Electro-pi.git
cd project-task-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values. See the Environment Variables section below.

---

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

> `DB_SUPERUSER` is only used by `npm run setup` to create the database and grant privileges.
> It is never used at runtime. On Mac with Homebrew Postgres it is your OS username.
> On Linux/Windows it is usually `postgres`.
> Run `psql postgres -c "\du"` to list available superusers on your machine.

---

## Setup Options

### Option A — With Docker (recommended, zero config)

Requires Docker Desktop to be running.

```bash
npm run docker:up
```

This starts PostgreSQL, Redis, and the app in containers. Migrations and seeds run automatically on startup. The API is available at `http://localhost:3000`.

To stop:

```bash
npm run docker:down
```

To view logs:

```bash
npm run docker:logs
```

---

### Option B — Without Docker (local PostgreSQL + Redis)

#### 1. Install and start PostgreSQL

**macOS (Homebrew):**

```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu:**

```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

#### 2. Install and start Redis

**macOS:**

```bash
brew install redis
brew services start redis
```

**Ubuntu:**

```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Windows:**
Download from https://github.com/microsoft/redis/releases or use WSL.

#### 3. Set DB_SUPERUSER in .env

Find your local PostgreSQL superuser:

```bash
psql postgres -c "\du"
```

Set it in `.env`:

```env
DB_SUPERUSER=your_superuser_name
DB_SUPERUSER_PASSWORD=
```

#### 4. Run setup

```bash
npm run setup
```

This single command will:

- Create the database and user if they don't exist
- Grant the necessary privileges
- Run all migrations
- Seed default data (admin + member users, sample projects and tasks)
- Start the server

The API will be available at `http://localhost:3000`.

---

### Option C — Manual database setup

If you prefer to manage the database yourself:

```bash
# Create database and user
psql postgres -c "CREATE ROLE app_user WITH LOGIN PASSWORD 'password';"
psql postgres -c "CREATE DATABASE node_app OWNER app_user;"

# Run migrations
npm run migration:run

# Seed data
npm run seed

# Start dev server
npm run dev
```

---

## Default Seed Users

| Role   | Email           | Password  |
| ------ | --------------- | --------- |
| Admin  | admin@test.com  | admin123  |
| Member | member@test.com | member123 |

---

## API Documentation

Swagger UI is available at:

```
http://localhost:3000/api-docs
```

---

## API Endpoints

### Health

| Method | Endpoint    | Auth |
| ------ | ----------- | ---- |
| GET    | /api/health | No   |

---

### Auth

| Method | Endpoint           | Auth |
| ------ | ------------------ | ---- |
| POST   | /api/auth/register | No   |
| POST   | /api/auth/login    | No   |
| POST   | /api/auth/logout   | Yes  |
| GET    | /api/auth/me       | Yes  |

---

### Projects

| Method | Endpoint          | Auth | Role        |
| ------ | ----------------- | ---- | ----------- |
| POST   | /api/projects     | Yes  | Any         |
| GET    | /api/projects     | Yes  | Any         |
| GET    | /api/projects/:id | Yes  | Any         |
| PUT    | /api/projects/:id | Yes  | Owner/Admin |
| DELETE | /api/projects/:id | Yes  | Owner/Admin |

---

### Tasks

| Method | Endpoint                           | Auth | Role  |
| ------ | ---------------------------------- | ---- | ----- |
| POST   | /api/projects/:projectId/tasks     | Yes  | Admin |
| GET    | /api/projects/:projectId/tasks     | Yes  | Any   |
| GET    | /api/projects/:projectId/tasks/:id | Yes  | Any   |
| PUT    | /api/projects/:projectId/tasks/:id | Yes  | Admin |
| DELETE | /api/projects/:projectId/tasks/:id | Yes  | Admin |

---

## Query Parameters

### GET /api/projects

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| page      | number | Page number    |
| limit     | number | Items per page |

### GET /api/projects/:projectId/tasks

| Parameter | Type   | Values                     |
| --------- | ------ | -------------------------- |
| status    | string | pending, in_progress, done |
| priority  | string | low, medium, high          |
| page      | number | Page number                |
| limit     | number | Items per page             |

---

## Scripts

| Command                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| npm run setup            | Create DB + migrate + seed + start (local no-Docker) |
| npm run dev              | Start dev server with hot reload                     |
| npm run build            | Compile TypeScript to dist/                          |
| npm run start            | Start production server from dist/                   |
| npm run test             | Run all tests (serial)                               |
| npm run test:watch       | Run tests in watch mode                              |
| npm run migration:run    | Run pending migrations                               |
| npm run migration:revert | Revert last migration                                |
| npm run seed             | Seed database with default data                      |
| npm run docker:up        | Build and start Docker containers                    |
| npm run docker:down      | Stop Docker containers                               |
| npm run docker:logs      | Stream app container logs                            |

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained from `/api/auth/login`. Logged-out tokens are blacklisted in Redis.

---

## Response Format

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |

---

## Architecture

```
Request → Routes → Middleware → Controllers → Services → Repositories → Database
```

- **Controllers** handle HTTP request/response
- **Services** contain business logic
- **Repositories** abstract database queries
- **Middleware** handles auth, validation, and error handling

---

## Security

- bcrypt password hashing (cost factor 10)
- JWT authentication with expiry
- Redis token blacklist on logout
- Input validation on all endpoints via express-validator
- Role-based access control (admin/member)
- Parameterized queries via TypeORM (SQL injection prevention)

---

## Performance

- Redis caching for read-heavy endpoints
- Pagination on all list endpoints
- Indexed foreign keys and frequently filtered columns
