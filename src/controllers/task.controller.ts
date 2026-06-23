import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as taskService from "../services/task.service";

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { projectId } = req.params;
    const task = await taskService.createTask({ ...req.body, projectId });
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
    const { projectId } = req.params;
    const { status, priority, page, limit } = req.query;
    const result = await taskService.getProjectTasks(
      projectId as string,
      { status: status as string, priority: priority as string },
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10,
    );
    res.status(200).json({ success: true, data: result });
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
    const { projectId, id } = req.params;
    const task = await taskService.getTaskById(
      id as string,
      projectId as string,
    );
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
    const { projectId, id } = req.params;
    const task = await taskService.updateTask(
      id as string,
      projectId as string,
      req.body,
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
    const { projectId, id } = req.params;
    const result = await taskService.deleteTask(
      id as string,
      projectId as string,
    );
    res.status(200).json({ success: true, data: result });
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
    const { status, priority, page, limit } = req.query;
    const result = await taskService.getAllTasksAdmin(
      {
        status: status as string,
        priority: priority as string,
      },
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10,
    );
    res.status(200).json({ success: true, data: result });
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
    const { id } = req.params;
    const task = await taskService.getTaskByIdAdmin(id as string);
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
    const { id } = req.params;
    const task = await taskService.updateTaskAdmin(id as string, req.body);
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
    const { id } = req.params;
    const result = await taskService.deleteTaskAdmin(id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
