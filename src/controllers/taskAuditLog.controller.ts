import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as taskAuditLogService from "../services/taskAuditLog.service";

export const getAuditLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const taskId = req.params.id as string;
    const logs = await taskAuditLogService.getTaskAuditLog(taskId);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
