// src/test/utils/auth.helper.ts
import * as dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import bcrypt from "bcryptjs";
import { app, setupTestDB } from "./testApp";
import { AppDataSource } from "../../config/database";
import { User, UserRole } from "../../models/User";

export const getAuthToken = async (): Promise<string> => {
  await setupTestDB();

  const userRepo = AppDataSource.getRepository(User);

  const existing = await userRepo.findOne({
    where: { email: "admin@test.com" },
  });

  if (!existing) {
    await userRepo.save(
      userRepo.create({
        name: "Admin",
        email: "admin@test.com",
        password: await bcrypt.hash("admin123", 10),
        role: UserRole.ADMIN,
      }),
    );
  }

  const res = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "admin123",
  });

  if (!res.body.data?.token) {
    throw new Error(`getAuthToken failed: ${JSON.stringify(res.body)}`);
  }

  return res.body.data.token;
};
