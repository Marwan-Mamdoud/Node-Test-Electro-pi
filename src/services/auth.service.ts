import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repo";
import { generateToken } from "../utils/jwt";
import redis from "../config/redis";
import { UserRole } from "../models/User";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const existing = await UserRepository.findByEmail(email);
  if (existing) throw { status: 409, message: "Email already registered" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = UserRepository.create({ name, email, password: hashedPassword });
  const saved = await UserRepository.save(user);

  const token = generateToken(saved.id, saved.role);
  return {
    user: {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
    },
    token,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await UserRepository.findByEmail(email);
  if (!user) throw { status: 401, message: "Invalid credentials" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, message: "Invalid credentials" };

  const token = generateToken(user.id, user.role);
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
};

export const logoutUser = async (token: string): Promise<void> => {
  const decoded = JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString(),
  );
  const expiry = decoded.exp - Math.floor(Date.now() / 1000);
  await redis.setex(`blacklist:${token}`, expiry > 0 ? expiry : 1, "revoked");
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const result = await redis.get(`blacklist:${token}`);
  return result !== null;
};

export const getAllUsersService = async () => {
  return UserRepository.find({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getUserByIdService = async (id: string) => {
  const user = await UserRepository.findById(id);
  if (!user) throw { status: 404, message: "User not found" };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const deleteUserService = async (id: string) => {
  const result = await UserRepository.delete(id);
  if (result.affected === 0) throw { status: 404, message: "User not found" };
};

export const updateUserRoleService = async (id: string, role: string) => {
  const user = await UserRepository.findById(id);
  if (!user) throw { status: 404, message: "User not found" };

  user.role = role as UserRole;
  const updated = await UserRepository.save(user);

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
  };
};

// services/auth.service.ts

export const getMeService = async (userId: string) => {
  const user = await UserRepository.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const updateProfileService = async (
  userId: string,
  data: { name?: string; email?: string },
) => {
  const user = await UserRepository.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  if (data.email && data.email !== user.email) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing && existing.id !== userId)
      throw { status: 409, message: "Email already in use" };
    user.email = data.email;
  }

  if (data.name) user.name = data.name;

  const updated = await UserRepository.save(user);

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
};

export const updatePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await UserRepository.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw { status: 401, message: "Current password is incorrect" };

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await UserRepository.save(user);
};

export const adminUpdateUserService = async (
  userId: string,
  data: { name?: string; email?: string; role?: string },
) => {
  const user = await UserRepository.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  if (data.email && data.email !== user.email) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing && existing.id !== userId)
      throw { status: 409, message: "Email already in use by another user" };
    user.email = data.email;
  }

  if (data.name) user.name = data.name;
  if (data.role) user.role = data.role as UserRole;

  const updated = await UserRepository.save(user);

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
};

export const adminUpdateUserPasswordService = async (
  userId: string,
  newPassword: string,
) => {
  const user = await UserRepository.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await UserRepository.save(user);
};
