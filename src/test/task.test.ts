import request from "supertest";
import { app, setupTestDB, clearDB, teardownTestDB } from "./utils/testApp";
import { getAuthToken } from "./utils/auth.helper";

describe("Task Module", () => {
  let token: string;
  let projectId: string;

  beforeAll(async () => {
    await setupTestDB();
    await clearDB();
    token = await getAuthToken();

    const projectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Project for Tasks",
        description: "Test project",
      });

    if (!projectRes.body.data?.id) {
      throw new Error(
        `Failed to create project in beforeAll. Response: ${JSON.stringify(projectRes.body)}`,
      );
    }

    projectId = projectRes.body.data.id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it("should create task in project", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Task 1",
        description: "Task description",
        status: "pending",
        priority: "high",
        dueDate: "2026-12-31",
      });

    if (res.status !== 201) {
      console.log("TASK ERROR RESPONSE:", res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});
