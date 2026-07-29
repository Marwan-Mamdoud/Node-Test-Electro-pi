import request from "supertest";
import {
  app,
  setupTestDB,
  clearDB,
  teardownTestDB,
} from "./utils/testApp";
import { getAdminToken, getMemberToken } from "./utils/auth.helper";

describe("Task Module", () => {
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

    // Create a project
    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Task Test Project", description: "For task tests" });
    projectId = projectRes.body.data.id;

    // Get member ID and add to project
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${memberToken}`);
    memberId = meRes.body.data.id;

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ userId: memberId });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe("POST /api/projects/:projectId/tasks — Create Task", () => {
    it("should create a task with creatorId set from authenticated user", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "First Task",
          description: "Task description",
          status: "TODO",
          priority: "high",
          dueDate: "2026-12-31",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe("First Task");
      expect(res.body.data.status).toBe("TODO");
      expect(res.body.data.creatorId).toBeDefined();
      taskId = res.body.data.id;
    });

    it("should ignore creatorId from request body and use session user", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Task with fake creator",
          creatorId: "00000000-0000-0000-0000-000000000000",
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toMatch(/creatorId/i);
    });

    it("should reject assignee who is not a project member", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Task with bad assignee",
          assigneeId: "00000000-0000-0000-0000-000000000000",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/member/i);
    });

    it("should create task with valid assignee (project member)", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Task with assignee",
          status: "IN_PROGRESS",
          priority: "medium",
          assigneeId: memberId,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.assigneeId).toBe(memberId);
    });
  });

  describe("GET /api/projects/:projectId/tasks — List & Filter", () => {
    it("should list tasks for a project", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
    });

    it("should filter tasks by status", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?status=TODO`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(
        res.body.data.every((t: any) => t.status === "TODO"),
      ).toBe(true);
    });

    it("should filter tasks by priority", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?priority=high`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(
        res.body.data.every((t: any) => t.priority === "high"),
      ).toBe(true);
    });

    it("should filter tasks by assignee", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?assignee=${memberId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(
        res.body.data.every((t: any) => t.assigneeId === memberId),
      ).toBe(true);
    });

    it("should search tasks by title", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?search=First`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toMatch(/First/i);
    });

    it("should return paginated response with meta shape", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks?page=1&limit=2`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.meta.total).toBeDefined();
      expect(res.body.meta.totalPages).toBeDefined();
    });
  });

  describe("GET /api/projects/:projectId/tasks/:id — Read Single", () => {
    it("should get a task by ID", async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(taskId);
      expect(res.body.data.creator).toBeDefined();
    });
  });

  describe("PUT /api/projects/:projectId/tasks/:id — Update", () => {
    it("should update a task's status", async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}/tasks/${taskId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "DONE" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("DONE");
    });
  });

  describe("DELETE /api/projects/:projectId/tasks/:id — Delete Authorization", () => {
    it("should allow admin to delete a task", async () => {
      const createRes = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "To be deleted" });
      const deleteId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/projects/${projectId}/tasks/${deleteId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it("should allow task creator (non-admin) to delete their own task", async () => {
      const createRes = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ title: "Member created task" });
      const deleteId = createRes.body.data.id;
      expect(createRes.body.data.creatorId).toBe(memberId);

      const res = await request(app)
        .delete(`/api/projects/${projectId}/tasks/${deleteId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
    });

    it("should return 403 when non-admin non-creator tries to delete", async () => {
      const createRes = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Admin only delete" });
      const deleteId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/projects/${projectId}/tasks/${deleteId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("Task Audit Log", () => {
    let auditTaskId: string;

    beforeAll(async () => {
      // Create a fresh task in TODO status for audit log tests
      const res = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Audit Log Test Task",
          status: "TODO",
          priority: "medium",
        });
      auditTaskId = res.body.data.id;
    });

    it("should create an audit log entry when status changes", async () => {
      // Change status from TODO -> IN_PROGRESS
      const updateRes = await request(app)
        .put(`/api/projects/${projectId}/tasks/${auditTaskId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "IN_PROGRESS" });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe("IN_PROGRESS");

      // Fetch audit log
      const logRes = await request(app)
        .get(`/api/projects/${projectId}/tasks/${auditTaskId}/audit-log`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(logRes.status).toBe(200);
      expect(Array.isArray(logRes.body.data)).toBe(true);
      expect(logRes.body.data.length).toBeGreaterThanOrEqual(1);

      const entry = logRes.body.data[0];
      expect(entry.oldStatus).toBe("TODO");
      expect(entry.newStatus).toBe("IN_PROGRESS");
      expect(entry.changedBy).toBeDefined();
      expect(entry.taskId).toBe(auditTaskId);
      expect(entry.changedAt).toBeDefined();
    });

    it("should NOT create an audit log entry when a non-status field changes", async () => {
      // Record audit log count before update
      const beforeRes = await request(app)
        .get(`/api/projects/${projectId}/tasks/${auditTaskId}/audit-log`)
        .set("Authorization", `Bearer ${adminToken}`);
      const countBefore = beforeRes.body.data.length;

      // Update only priority (not status)
      const updateRes = await request(app)
        .put(`/api/projects/${projectId}/tasks/${auditTaskId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ priority: "high" });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.priority).toBe("high");

      // Audit log count should be unchanged
      const afterRes = await request(app)
        .get(`/api/projects/${projectId}/tasks/${auditTaskId}/audit-log`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(afterRes.body.data.length).toBe(countBefore);
    });

    it("should return 403 on audit-log endpoint for user without project access", async () => {
      // Create a project the member is NOT a member of
      const otherProjectRes = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Private Project" });
      const otherProjectId = otherProjectRes.body.data.id;

      // Create a task in that project
      const taskRes = await request(app)
        .post(`/api/projects/${otherProjectId}/tasks`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Private Task", status: "TODO" });
      const otherTaskId = taskRes.body.data.id;

      // Member tries to access audit log on a project they are not a member of
      const res = await request(app)
        .get(`/api/projects/${otherProjectId}/tasks/${otherTaskId}/audit-log`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("RBAC Enforcement", () => {
    it("should return 403 when member tries to access admin-only endpoint", async () => {
      const res = await request(app)
        .get("/api/auth/users")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });
});
