import request from "supertest";
import {
  app,
  setupTestDB,
  clearDB,
  teardownTestDB,
} from "./utils/testApp";
import { getAdminToken, getMemberToken } from "./utils/auth.helper";

describe("Admin Authorization — 403 Enforcement", () => {
  let adminToken: string;
  let memberToken: string;
  let projectId: string;
  let taskId: string;
  let memberId: string;

  beforeAll(async () => {
    await setupTestDB();
    await clearDB();
    adminToken = await getAdminToken();
    memberToken = await getMemberToken();

    // Get member ID
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${memberToken}`);
    memberId = meRes.body.data.id;

    // Create a project as admin
    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Admin Test Project" });
    projectId = projectRes.body.data.id;

    // Create a task as admin
    const taskRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Admin Test Task", status: "TODO" });
    taskId = taskRes.body.data.id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // ─── Auth Admin Endpoints ────────────────────────────────

  describe("Auth Admin Endpoints", () => {
    it("GET /api/auth/users — 403 for member", async () => {
      const res = await request(app)
        .get("/api/auth/users")
        .set("Authorization", `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    it("GET /api/auth/users — returns paginated results for admin", async () => {
      const res = await request(app)
        .get("/api/auth/users?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
      expect(res.body.meta.totalPages).toBeDefined();
    });

    it("GET /api/auth/users — supports search by name or email", async () => {
      const res = await request(app)
        .get("/api/auth/users?search=admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("GET /api/auth/users/:id — 403 for member", async () => {
      const res = await request(app)
        .get(`/api/auth/users/${memberId}`)
        .set("Authorization", `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    it("DELETE /api/auth/users/:id — 403 for member", async () => {
      const res = await request(app)
        .delete(`/api/auth/users/00000000-0000-0000-0000-000000000000`)
        .set("Authorization", `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    it("PATCH /api/auth/users/:id/role — 403 for member (cannot self-promote)", async () => {
      const res = await request(app)
        .patch(`/api/auth/users/${memberId}/role`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ role: "admin" });
      expect(res.status).toBe(403);
    });

    it("PUT /api/auth/users/:id — 403 for member", async () => {
      const res = await request(app)
        .put(`/api/auth/users/${memberId}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ name: "Hacked Name" });
      expect(res.status).toBe(403);
    });
  });

  // ─── Project Admin Endpoints ─────────────────────────────

  describe("Project Admin Endpoints", () => {
    it("GET /api/projects/admin/projects — 403 for member", async () => {
      const res = await request(app)
        .get("/api/projects/admin/projects")
        .set("Authorization", `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    it("GET /api/projects/admin/projects/:id — 403 for member", async () => {
      const res = await request(app)
        .get(`/api/projects/admin/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    it("PUT /api/projects/admin/projects/:id — 403 for member", async () => {
      const res = await request(app)
        .put(`/api/projects/admin/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ title: "Hacked Project" });
      expect(res.status).toBe(403);
    });

    it("DELETE /api/projects/admin/projects/:id — 403 for member", async () => {
      const res = await request(app)
        .delete(`/api/projects/admin/projects/${projectId}`)
        .set("Authorization", `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });
  });

  // ─── Task Admin Endpoints ────────────────────────────────

  describe("Task Admin Endpoints", () => {
    it("GET /api/projects/:projectId/tasks/admin/tasks — 403 for member", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks/admin/tasks`)
        .set("Authorization", `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    it("GET /api/projects/:projectId/tasks/admin/tasks/:id — 403 for member", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks/admin/tasks/${taskId}`)
        .set("Authorization", `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });

    it("PUT /api/projects/:projectId/tasks/admin/tasks/:id — 403 for member", async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}/tasks/admin/tasks/${taskId}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ title: "Hacked Task" });
      expect(res.status).toBe(403);
    });

    it("DELETE /api/projects/:projectId/tasks/admin/tasks/:id — 403 for member", async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}/tasks/admin/tasks/${taskId}`)
        .set("Authorization", `Bearer ${memberToken}`);
      expect(res.status).toBe(403);
    });
  });

  // ─── Unauthenticated Access ──────────────────────────────

  describe("Unauthenticated Access — All Admin Endpoints", () => {
    it("GET /api/auth/users — 401 without token", async () => {
      const res = await request(app).get("/api/auth/users");
      expect(res.status).toBe(401);
    });

    it("GET /api/projects/admin/projects — 401 without token", async () => {
      const res = await request(app).get("/api/projects/admin/projects");
      expect(res.status).toBe(401);
    });

    it("GET /api/projects/:projectId/tasks/admin/tasks — 401 without token", async () => {
      const res = await request(app).get(
        `/api/projects/${projectId}/tasks/admin/tasks`,
      );
      expect(res.status).toBe(401);
    });
  });

  // ─── PUT /api/auth/me — Own Account Only ─────────────────

  describe("PUT /api/auth/me — Own Account Verification", () => {
    it("should only update the authenticated user's own profile", async () => {
      const res = await request(app)
        .put("/api/auth/me")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ name: "Updated Member Name" });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Updated Member Name");
      expect(res.body.data.id).toBe(memberId);
    });

    it("PUT /api/auth/me — should not accept an :id param (operates on session only)", async () => {
      // The route is PUT /me — no :id param exists, so this just updates own profile
      const res = await request(app)
        .put("/api/auth/me")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ name: "Still Member" });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(memberId);
    });
  });
});
