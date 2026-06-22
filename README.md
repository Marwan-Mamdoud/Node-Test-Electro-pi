# Node-Test-Electro-pi

---

## README.md

Create **`README.md`** in your project root:

```markdown
# Project & Task Management API

A RESTful API for managing projects and tasks with JWT authentication, built with Node.js, TypeScript, Express, PostgreSQL, and Redis.

## Tech Stack

| Category       | Technology            |
| -------------- | --------------------- |
| Runtime        | Node.js 18+           |
| Framework      | Express.js            |
| Language       | TypeScript            |
| Database       | PostgreSQL            |
| ORM            | TypeORM               |
| Authentication | JWT (JSON Web Tokens) |
| Validation     | express-validator     |
| Cache          | Redis                 |
| API Docs       | Swagger/OpenAPI       |
| Testing        | Jest + Supertest      |

## Features

- **Authentication**: User registration, login, logout with JWT tokens
- **Projects**: Create, read, update, delete projects
- **Tasks**: Create, read, update, delete tasks under projects
- **Filtering**: Filter tasks by status (pending, in_progress, done) or priority (low, medium, high)
- **Pagination & Sorting**: All list endpoints support pagination
- **Role-Based Access Control**: Admin and Member roles
- **Redis Caching**: Performance optimization with cache invalidation
- **Health Check**: Monitor database and Redis connectivity
- **Input Validation**: All inputs validated with express-validator
- **Error Handling**: Consistent error responses with proper HTTP status codes

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Redis 7 or higher

## Project Structure
```

src/
├── config/ # Database and Redis configuration
├── controllers/ # Request handlers
├── middleware/ # Auth, validation, error handling
├── models/ # TypeORM entities
├── repositories/ # Data access layer
├── routes/ # API routes
├── services/ # Business logic
├── validators/ # Input validation rules
├── utils/ # JWT helper functions
├── database/ # Migrations and seeds
│ ├── migrations/
│ └── seeds/
└── **tests**/ # Unit tests

````

## Environment Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd project-task-api
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example file and update with your credentials:

```bash
cp .env.example .env
```

### Required Environment Variables

| Variable         | Description         | Example           |
| ---------------- | ------------------- | ----------------- |
| `PORT`           | Server port         | `3000`            |
| `NODE_ENV`       | Environment         | `development`     |
| `DB_HOST`        | PostgreSQL host     | `localhost`       |
| `DB_PORT`        | PostgreSQL port     | `5432`            |
| `DB_USERNAME`    | PostgreSQL username | `user`            |
| `DB_PASSWORD`    | PostgreSQL password | `password`        |
| `DB_NAME`        | PostgreSQL database | `Node`            |
| `REDIS_HOST`     | Redis host          | `localhost`       |
| `REDIS_PORT`     | Redis port          | `6379`            |
| `JWT_SECRET`     | JWT signing secret  | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiry        | `24h`             |

### 4. Setup Database

```bash
# Create database and user
psql -U postgres -c "CREATE DATABASE Node;"
psql -U postgres -c "CREATE USER \"user\" WITH PASSWORD 'password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE Node TO \"user\";"
```

### 5. Setup Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis
```

### 6. Run Migrations

```bash
npm run migration:run
```

### 7. Run Seeds (Optional)

```bash
npm run seed
```

Creates default users:

- Admin: `admin@test.com` / `admin123`
- Member: `member@test.com` / `member123`

### 8. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## API Documentation

Interactive Swagger UI available at:

```
http://localhost:3000/api-docs
```

## API Endpoints

### Health

| Method | Endpoint      | Auth | Description         |
| ------ | ------------- | ---- | ------------------- |
| GET    | `/api/health` | No   | System health check |

### Authentication

| Method | Endpoint             | Auth | Description       |
| ------ | -------------------- | ---- | ----------------- |
| POST   | `/api/auth/register` | No   | Register new user |
| POST   | `/api/auth/login`    | No   | Login and get JWT |
| POST   | `/api/auth/logout`   | Yes  | Invalidate JWT    |

### Projects

| Method | Endpoint            | Auth | Description               |
| ------ | ------------------- | ---- | ------------------------- |
| POST   | `/api/projects`     | Yes  | Create project            |
| GET    | `/api/projects`     | Yes  | List projects (paginated) |
| GET    | `/api/projects/:id` | Yes  | Get single project        |
| PUT    | `/api/projects/:id` | Yes  | Update project            |
| DELETE | `/api/projects/:id` | Yes  | Delete project            |

### Tasks

| Method | Endpoint                             | Auth | Description           |
| ------ | ------------------------------------ | ---- | --------------------- |
| POST   | `/api/projects/:projectId/tasks`     | Yes  | Create task           |
| GET    | `/api/projects/:projectId/tasks`     | Yes  | List tasks (filtered) |
| GET    | `/api/projects/:projectId/tasks/:id` | Yes  | Get single task       |
| PUT    | `/api/projects/:projectId/tasks/:id` | Yes  | Update task           |
| DELETE | `/api/projects/:projectId/tasks/:id` | Yes  | Delete task           |

### Query Parameters

**List Projects:**

- `page` (number): Page number
- `limit` (number): Items per page

**List Tasks:**

- `status` (string): Filter by `pending`, `in_progress`, `done`
- `priority` (string): Filter by `low`, `medium`, `high`
- `page` (number): Page number
- `limit` (number): Items per page

## Available Scripts

| Command                    | Description                              |
| -------------------------- | ---------------------------------------- |
| `npm run dev`              | Start development server with hot reload |
| `npm run build`            | Compile TypeScript to JavaScript         |
| `npm run start`            | Start production server                  |
| `npm run test`             | Run Jest unit tests                      |
| `npm run migration:run`    | Execute database migrations              |
| `npm run migration:revert` | Revert last migration                    |
| `npm run seed`             | Run database seeds                       |
| `npm run docker:up`        | Start with Docker Compose                |
| `npm run docker:down`      | Stop Docker Compose                      |

## Docker Setup (Optional)

Requires Docker Desktop installed.

```bash
# Start all services (PostgreSQL, Redis, App)
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

Obtain a token by registering or logging in via `/api/auth/register` or `/api/auth/login`.

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## Testing

Run the test suite:

```bash
npm run test
```

Tests cover:

- User registration and login
- JWT authentication
- Project CRUD operations
- Task CRUD operations
- Input validation
- Error handling

## Architecture

This project follows a layered architecture:

```
Request → Routes → Middleware → Controllers → Services → Repositories → Models → Database
```

- **Routes**: Define API endpoints
- **Middleware**: Authentication, validation, error handling
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and caching
- **Repositories**: Database access abstraction
- **Models**: TypeORM entities

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with configurable expiry
- Token blacklisting on logout (Redis)
- Input validation on all endpoints
- Role-based access control
- SQL injection protection via parameterized queries

## Performance Features

- Redis caching for frequently accessed data
- Cache invalidation on data mutations
- Pagination on all list endpoints
- Database indexing on foreign keys

## License

MIT

````

---

## Also Update `.env.example`

Make sure it exists and matches:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h
````

---
