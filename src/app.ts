import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import healthRoutes from "./routes/health.route";
import { errorHandler } from "./middleware/errorHandler";
import swaggerJSDoc from "swagger-jsdoc";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3001")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);

app.use(express.json());

/**
 * Swagger must NOT run during tests
 * because it parses route files and can crash app initialization.
 */
const isTest = process.env.NODE_ENV === "test";

if (!isTest) {
  const swaggerUi = require("swagger-ui-express");
  const swaggerJsdoc = require("swagger-jsdoc");

  const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Project & Task Management API",
        version: "1.0.0",
        description:
          "RESTful API for managing projects and tasks with JWT authentication, role-based access control, project membership, and audit logging.",
        contact: { name: "API Support" },
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          User: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              email: { type: "string", format: "email" },
              role: { type: "string", enum: ["admin", "member"] },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          Project: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              title: { type: "string" },
              description: { type: "string", nullable: true },
              status: {
                type: "string",
                enum: ["active", "archived", "completed"],
              },
              ownerId: { type: "string", format: "uuid" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          ProjectMember: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              projectId: { type: "string", format: "uuid" },
              userId: { type: "string", format: "uuid" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          Task: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              title: { type: "string" },
              description: { type: "string", nullable: true },
              status: {
                type: "string",
                enum: ["TODO", "IN_PROGRESS", "DONE"],
              },
              priority: { type: "string", enum: ["low", "medium", "high"] },
              dueDate: {
                type: "string",
                format: "date",
                nullable: true,
              },
              projectId: { type: "string", format: "uuid" },
              creatorId: {
                type: "string",
                format: "uuid",
                description:
                  "ID of the user who created this task (set automatically)",
              },
              assigneeId: {
                type: "string",
                format: "uuid",
                nullable: true,
                description:
                  "ID of the user assigned to this task (null if unassigned)",
              },
              creator: {
                $ref: "#/components/schemas/User",
                description: "The user who created this task",
              },
              assignee: {
                $ref: "#/components/schemas/User",
                nullable: true,
                description: "The user assigned to this task",
              },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          TaskAuditLog: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              taskId: { type: "string", format: "uuid" },
              changedBy: { type: "string", format: "uuid" },
              oldStatus: {
                type: "string",
                enum: ["TODO", "IN_PROGRESS", "DONE"],
              },
              newStatus: {
                type: "string",
                enum: ["TODO", "IN_PROGRESS", "DONE"],
              },
              changedAt: { type: "string", format: "date-time" },
              user: { $ref: "#/components/schemas/User" },
            },
          },
          PaginatedProjects: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { $ref: "#/components/schemas/Project" },
              },
              meta: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  totalPages: { type: "integer" },
                },
              },
            },
          },
          PaginatedTasks: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { $ref: "#/components/schemas/Task" },
              },
              meta: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  totalPages: { type: "integer" },
                },
              },
            },
          },
          Error: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string" },
              errors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: { type: "string" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    apis: [
      process.env.NODE_ENV === "production"
        ? "./dist/routes/*.js"
        : "./src/routes/*.ts",
    ],
  };

  const specs = swaggerJsdoc(swaggerOptions);

  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}

/**
 * Routes (always enabled)
 */
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

/**
 * Error handler
 */
app.use(errorHandler);

export default app;
