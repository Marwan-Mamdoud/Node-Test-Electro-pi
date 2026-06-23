import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  deleteUserService,
  getUserByIdService,
  updateUserRoleService,
  getAllUsersService,
  getMeService,
  updateProfileService,
  updatePasswordService,
  adminUpdateUserService,
} from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";
import { UserRole } from "../models/User";

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

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id as string);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await deleteUserService(id as string);
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await updateUserRoleService(id as string, role as UserRole);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const user = await getMeService(userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const { name, email } = req.body;
    const user = await updateProfileService(userId, { name, email });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;
    await updatePasswordService(userId, currentPassword, newPassword);
    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const user = await adminUpdateUserService(id as string, {
      name,
      email,
      role,
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
