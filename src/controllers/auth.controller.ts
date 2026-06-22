import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, logoutUser } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser(name, email, password);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(400).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    await logoutUser(token);

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
