import request from "supertest";
import { app, setupTestDB, clearDB, teardownTestDB } from "./utils/testApp";
import { getAuthToken } from "./utils/auth.helper";

describe("Projects Module", () => {
  let token: string;
  let projectId: string;

  beforeAll(async () => {
    await setupTestDB();
    await clearDB();
    token = await getAuthToken();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it("should create project", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Project",
        description: "Desc",
      });

    if (res.status !== 201) {
      console.log("PROJECT ERROR RESPONSE:", res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();

    projectId = res.body.data.id;
  });

  it("should get projects", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    if (res.status !== 200) {
      console.log("GET PROJECTS ERROR RESPONSE:", res.body);
    }

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.projects)).toBe(true);
  });
});
