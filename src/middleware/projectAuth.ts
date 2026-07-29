import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { UserRole } from "../models/User";
import { ProjectMemberRepository } from "../repositories/projectMember.repo";

/**
 * Ensures the authenticated user has access to the project identified by :projectId.
 * - Global admins bypass all checks.
 * - For MEMBER role: must be project owner OR a ProjectMember.
 */
export const requireProjectAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  // Global admin bypasses membership checks
  if (req.user.role === UserRole.ADMIN) {
    return next();
  }

  const projectId = (req.params.projectId || req.params.id) as string;
  if (!projectId) {
    res.status(400).json({ message: "Project ID is required" });
    return;
  }

  const isMember = await ProjectMemberRepository.isMember(
    projectId,
    req.user.userId,
  );

  if (isMember) {
    return next();
  }

  // Check if user is the project owner via the project repository
  const { ProjectRepository } = await import(
    "../repositories/project.repo"
  );
  const project = await ProjectRepository.findById(projectId, req.user.userId);

  if (project) {
    return next();
  }

  res.status(403).json({
    message: "You do not have access to this project",
  });
};
