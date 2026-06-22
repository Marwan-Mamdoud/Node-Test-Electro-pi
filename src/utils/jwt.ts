import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallbacksecret";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "24h") as jwt.SignOptions["expiresIn"];

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (
  token: string,
): { userId: string; role: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
};
