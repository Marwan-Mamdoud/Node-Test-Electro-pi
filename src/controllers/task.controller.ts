import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as taskService from "../services/task.service";
import { body } from "express-validator";

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.projectId as string;
    // Strip creatorId from body — always derive from session
    const { creatorId: _ignored, ...body } = req.body;

    const task = await taskService.createTask(
      { ...body, projectId },
      req.user!.userId,
    );
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.projectId as string;
    const { status, priority, assignee, search, sortBy, sortOrder } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await taskService.getProjectTasks(
      projectId,
      {
        status: status as string,
        priority: priority as string,
        assignee: assignee as string,
        search: search as string,
      },
      {
        page,
        limit,
        sortBy: sortBy as string,
        sortOrder:
          (sortOrder as string)?.toUpperCase() === "ASC" ? "ASC" : "DESC",
      },
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.projectId as string;
    const id = req.params.id as string;
    const task = await taskService.getTaskById(id, projectId);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.projectId as string;
    const id = req.params.id as string;
    console.log(`[Body]`, body);

    const task = await taskService.updateTask(
      id,
      projectId,
      req.body,
      req.user!.userId,
      req.user!.role,
    );
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = req.params.projectId as string;
    const id = req.params.id as string;
    const result = await taskService.deleteTask(
      id,
      projectId,
      req.user!.userId,
      req.user!.role,
    );
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const getAllTasksForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, priority, assignee, search, sortBy, sortOrder } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await taskService.getAllTasksAdmin(
      {
        status: status as string,
        priority: priority as string,
        assignee: assignee as string,
        search: search as string,
      },
      {
        page,
        limit,
        sortBy: sortBy as string,
        sortOrder:
          (sortOrder as string)?.toUpperCase() === "ASC" ? "ASC" : "DESC",
      },
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getTaskByIdForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const task = await taskService.getTaskByIdAdmin(id);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTaskForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const task = await taskService.updateTaskAdmin(id, req.body);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTaskForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const result = await taskService.deleteTaskAdmin(id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};
