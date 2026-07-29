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
    const sortBy = (req.query.sortBy as string) || undefined;
    const sortOrder =
      (req.query.sortOrder as string)?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const search = (req.query.search as string) || undefined;

    const result = await projectService.getUserProjects(
      req.user!.userId,
      req.user!.role,
      page,
      limit,
      sortBy,
      sortOrder,
      search,
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
    const id = req.params.id as string;
    const project = await projectService.getProjectById(
      id,
      req.user!.userId,
      req.user!.role,
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
    const id = req.params.id as string;
    const project = await projectService.updateProject(
      id,
      req.user!.userId,
      req.user!.role,
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
    const id = req.params.id as string;
    const result = await projectService.deleteProject(
      id,
      req.user!.userId,
      req.user!.role,
    );
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const getAllForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || undefined;
    const sortOrder =
      (req.query.sortOrder as string)?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const search = (req.query.search as string) || undefined;

    const result = await projectService.getAllProjectsAdmin(
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getOneForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const project = await projectService.getProjectByIdAdmin(id);
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const updateForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const project = await projectService.updateProjectAdmin(id, req.body);
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

export const removeForAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const result = await projectService.deleteProjectAdmin(id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};
