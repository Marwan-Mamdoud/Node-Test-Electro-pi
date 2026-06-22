import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as projectService from "../services/project.service";

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, status } = req.body;
    const project = await projectService.createProject(
      title,
      description,
      status,
      req.user!.userId,
    );
    res.status(201).json({ success: true, data: project });
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await projectService.getUserProjects(
      req.user!.userId,
      page,
      limit,
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
    const project = await projectService.getProjectById(
      req.params.id as string,
      req.user!.userId,
    );
    res.status(200).json({ success: true, data: project });
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
    const project = await projectService.updateProject(
      req.params.id as string,
      req.user!.userId,
      req.body,
    );
    res.status(200).json({ success: true, data: project });
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
    const result = await projectService.deleteProject(
      req.params.id as string,
      req.user!.userId,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
