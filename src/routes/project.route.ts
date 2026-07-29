import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  createProjectValidation,
  updateProjectValidation,
  projectIdValidation,
} from "../validators/project.validator";
import {
  addMemberValidation,
  removeMemberValidation,
  projectIdParamValidation,
} from "../validators/projectMember.validator";
import * as projectController from "../controllers/project.controller";
import * as projectMemberController from "../controllers/projectMember.controller";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

/* ---------------- CREATE PROJECT ---------------- */
/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", validate(createProjectValidation), projectController.create);

/* ---------------- GET PROJECTS ---------------- */
/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get projects accessible to the authenticated user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", projectController.getAll);

/* ---------------- SINGLE PROJECT ---------------- */
/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 */
router.get("/:id", validate(projectIdValidation), projectController.getOne);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 */
router.put("/:id", validate(updateProjectValidation), projectController.update);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 */
router.delete(
  "/:id",
  validate(projectIdValidation),
  projectController.remove,
);

/* ---------------- PROJECT MEMBERS ---------------- */

/**
 * @swagger
 * /api/projects/{id}/members:
 *   get:
 *     summary: Get members of a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id/members",
  validate(projectIdParamValidation),
  projectMemberController.getMembers,
);

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Add a member to a project (admin or project owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:id/members",
  validate(addMemberValidation),
  projectMemberController.addMember,
);

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a project (admin or project owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id/members/:userId",
  validate(removeMemberValidation),
  projectMemberController.removeMember,
);

/* ---------------- ADMIN LAYER ---------------- */

router.use(authorize("admin"));

/**
 * @swagger
 * /api/projects/admin/projects:
 *   get:
 *     summary: Get all projects (admin scope)
 *     tags: [Admin]
 */
router.get("/admin/projects", projectController.getAllForAdmin);

/**
 * @swagger
 * /api/projects/admin/projects/{id}:
 *   get:
 *     summary: Get project by ID (admin scope)
 *     tags: [Admin]
 */
router.get(
  "/admin/projects/:id",
  validate(projectIdValidation),
  projectController.getOneForAdmin,
);

/**
 * @swagger
 * /api/projects/admin/projects/{id}:
 *   put:
 *     summary: Update any project (admin scope)
 *     tags: [Admin]
 */
router.put(
  "/admin/projects/:id",
  validate(projectIdValidation),
  projectController.updateForAdmin,
);

/**
 * @swagger
 * /api/projects/admin/projects/{id}:
 *   delete:
 *     summary: Delete any project (admin scope)
 *     tags: [Admin]
 */
router.delete(
  "/admin/projects/:id",
  validate(projectIdValidation),
  projectController.removeForAdmin,
);

export default router;
