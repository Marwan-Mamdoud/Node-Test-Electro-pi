import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { requireProjectAccess } from "../middleware/projectAuth";
import { validate } from "../middleware/validation";
import {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
} from "../validators/task.validator";
import * as taskController from "../controllers/task.controller";
import * as taskAuditLogController from "../controllers/taskAuditLog.controller";

const router = Router({ mergeParams: true });

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Project-scoped task management endpoints
 */

/* ---------------- CREATE TASK ---------------- */
/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   post:
 *     summary: Create task in project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  requireProjectAccess,
  validate(createTaskValidation),
  taskController.create,
);

/* ---------------- GET ALL TASKS ---------------- */
/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   get:
 *     summary: Get all tasks for a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", requireProjectAccess, taskController.getAll);

/* ---------------- SINGLE TASK ---------------- */
/**
 * @swagger
 * /api/projects/{projectId}/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id",
  requireProjectAccess,
  validate(taskIdValidation),
  taskController.getOne,
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 */
router.put(
  "/:id",
  requireProjectAccess,
  validate(updateTaskValidation),
  taskController.update,
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{id}:
 *   delete:
 *     summary: Delete task (admin or creator only)
 *     tags: [Tasks]
 */
router.delete(
  "/:id",
  requireProjectAccess,
  validate(taskIdValidation),
  taskController.remove,
);

/* ---------------- AUDIT LOG ---------------- */
/**
 * @swagger
 * /api/projects/{projectId}/tasks/{id}/audit-log:
 *   get:
 *     summary: Get task status change history
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id/audit-log",
  requireProjectAccess,
  validate(taskIdValidation),
  taskAuditLogController.getAuditLog,
);

/* ---------------- ADMIN SECTION ---------------- */

router.use(authorize("admin"));

/**
 * @swagger
 * /api/projects/{projectId}/tasks/admin/tasks:
 *   get:
 *     summary: Get ALL tasks (admin scoped)
 *     tags: [Admin]
 */
router.get("/admin/tasks", taskController.getAllTasksForAdmin);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/admin/tasks/{id}:
 *   get:
 *     summary: Get any task (admin scoped)
 *     tags: [Admin]
 */
router.get(
  "/admin/tasks/:id",
  validate(taskIdValidation),
  taskController.getTaskByIdForAdmin,
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/admin/tasks/{id}:
 *   put:
 *     summary: Update any task (admin scoped)
 *     tags: [Admin]
 */
router.put(
  "/admin/tasks/:id",
  validate(taskIdValidation),
  taskController.updateTaskForAdmin,
);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/admin/tasks/{id}:
 *   delete:
 *     summary: Delete any task (admin scoped)
 *     tags: [Admin]
 */
router.delete(
  "/admin/tasks/:id",
  validate(taskIdValidation),
  taskController.deleteTaskForAdmin,
);

export default router;
