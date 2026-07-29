import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as projectMemberService from "../services/projectMember.service";

export const addMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.id as string;
    const { userId, email } = req.body;
    const member = await projectMemberService.addMember(
      projectId,
      userId,
      email,
      req.user!.userId,
    );
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.id as string;
    const userId = req.params.userId as string;
    const result = await projectMemberService.removeMember(projectId, userId);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.id as string;
    const members = await projectMemberService.getProjectMembers(projectId);
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};
