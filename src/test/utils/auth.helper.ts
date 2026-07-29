import * as dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import bcrypt from "bcryptjs";
import { app, setupTestDB } from "./testApp";
import { AppDataSource } from "../../config/database";
import { User, UserRole } from "../../models/User";

const ensureUser = async (
  email: string,
  password: string,
  role: UserRole,
): Promise<void> => {
  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email } });
  if (!existing) {
    await userRepo.save(
      userRepo.create({
        name: role === UserRole.ADMIN ? "Admin" : "Member",
        email,
        password: await bcrypt.hash(password, 10),
        role,
      }),
    );
  }
};

export const getAdminToken = async (): Promise<string> => {
  await setupTestDB();
  await ensureUser("admin@test.com", "admin123", UserRole.ADMIN);

  const res = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "admin123",
  });

  if (!res.body.data?.token) {
    throw new Error(`getAdminToken failed: ${JSON.stringify(res.body)}`);
  }
  return res.body.data.token;
};

export const getMemberToken = async (): Promise<string> => {
  await setupTestDB();
  await ensureUser("member@test.com", "member123", UserRole.MEMBER);

  const res = await request(app).post("/api/auth/login").send({
    email: "member@test.com",
    password: "member123",
  });

  if (!res.body.data?.token) {
    throw new Error(`getMemberToken failed: ${JSON.stringify(res.body)}`);
  }
  return res.body.data.token;
};

export const getAuthToken = async (): Promise<string> => getAdminToken();
