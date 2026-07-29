import request from "supertest";
import { app, setupTestDB, clearDB, teardownTestDB } from "./utils/testApp";

describe("Auth Module", () => {
  beforeAll(async () => {
    await setupTestDB();
    await clearDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user and return token", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe("test@example.com");
      expect(res.body.data.user.role).toBe("member");
      expect(res.body.data.token).toBeDefined();
    });

    it("should reject duplicate email with 409", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User 2",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(409);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials and return token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe("test@example.com");
    });

    it("should reject invalid credentials with 401", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });
  });
});
