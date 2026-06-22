import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repo";
import { generateToken } from "../utils/jwt";
import redis from "../config/redis";

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
