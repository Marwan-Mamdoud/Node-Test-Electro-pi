import { Request, Response, NextFunction } from "express";
import { checkHealth } from "../services/health.service";

export const getHealth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const health = await checkHealth();
    const statusCode = health.status === "healthy" ? 200 : 503;

    res.status(statusCode).json({
      success: health.status === "healthy",
      data: health,
    });
  } catch (error) {
    next(error);
  }
};
