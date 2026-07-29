import request from "supertest";
import {
  app,
  setupTestDB,
  clearDB,
  teardownTestDB,
} from "./utils/testApp";
import { getAdminToken, getMemberToken } from "./utils/auth.helper";

describe("Projects Module", () => {
  let adminToken: string;
  let memberToken: string;
  let projectId: string;

  beforeAll(async () => {
    await setupTestDB();
    await clearDB();
    adminToken = await getAdminToken();
    memberToken = await getMemberToken();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe("POST /api/projects — Create", () => {
    it("should create a project as admin", async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Test Project", description: "A test project" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe("Test Project");
      projectId = res.body.data.id;
    });
  });

  describe("GET /api/projects — Access Scoping", () => {
    it("should return 200 for admin on any project (no membership required)", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(projectId);
    });

    it("should return 403 for member NOT in ProjectMember and NOT owner", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/not have access/i);
    });

    it("should return 200 for member after being added to ProjectMember", async () => {
      // Get member user ID by logging in and checking /api/auth/me
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${memberToken}`);
      const memberId = meRes.body.data.id;

      // Add member to project
      const addRes = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ userId: memberId });

      expect(addRes.status).toBe(201);

      // Member should now be able to access the project
      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(projectId);
    });

    it("should list members of a project", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should add a member by email", async () => {
      // Register a fresh user for this test
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Email Member",
          email: "emailmember@test.com",
          password: "pass1234",
        });
      const newUserId = registerRes.body.data.user.id;

      const res = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ email: "emailmember@test.com" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBe(newUserId);
    });

    it("should return 404 when adding member by non-existent email", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ email: "nobody@example.com" });

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/no user found/i);
    });
  });

  describe("GET /api/projects — Pagination", () => {
    it("should return paginated response with meta shape", async () => {
      const res = await request(app)
        .get("/api/projects?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
      expect(res.body.meta.totalPages).toBeDefined();
    });
  });
});
