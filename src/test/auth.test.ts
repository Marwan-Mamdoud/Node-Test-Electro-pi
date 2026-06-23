import request from "supertest";
import { app, setupTestDB, clearDB, teardownTestDB } from "./utils/testApp";

describe("Auth Module", () => {
  let token: string;

  beforeAll(async () => {
    await setupTestDB();
    await clearDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it("should register user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should login user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "123456",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();

    token = res.body.data.token;
  });

  it("should get current user", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("test@example.com");
  });
});
