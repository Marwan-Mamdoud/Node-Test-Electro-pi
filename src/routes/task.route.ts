import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
} from "../validators/task.validator";
import * as taskController from "../controllers/task.controller";

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
 * /api/projects/tasks/{projectId}:
 *   post:
 *     summary: Create task in project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", validate(createTaskValidation), taskController.create);

/* ---------------- GET ALL TASKS ---------------- */
/**
 * @swagger
 * /api/projects/tasks/{projectId}:
 *   get:
 *     summary: Get all tasks for a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", taskController.getAll);

/* ---------------- SINGLE TASK ---------------- */
/**
 * @swagger
 * /api/projects/tasks/{projectId}/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", validate(taskIdValidation), taskController.getOne);

/**
 * @swagger
 * /api/projects/tasks/{projectId}/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 */
router.put("/:id", validate(updateTaskValidation), taskController.update);

/**
 * @swagger
 * /api/projects/tasks/{projectId}/{id}:
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 */
router.delete("/:id", validate(taskIdValidation), taskController.remove);

/* ---------------- ADMIN SECTION (⚠ STILL SAME ROUTE TREE) ---------------- */

router.use(authorize("admin"));

/**
 * ⚠ IMPORTANT:
 * These routes are STILL under:
 * /api/projects/:projectId/tasks/admin/...
 * because of current router mounting
 */

/**
 * @swagger
 * /api/projects/tasks/{projectId}/admin/tasks:
 *   get:
 *     summary: Get ALL tasks (admin scoped - current project router context)
 *     tags: [Admin]
 */
router.get("/admin/tasks", taskController.getAllTasksForAdmin);

/**
 * @swagger
 * /api/projects/tasks/{projectId}/admin/tasks/{id}:
 *   get:
 *     summary: Get any task (admin scoped)
 *     tags: [Admin]
 */
router.get(
  "/tasks/:id",
  validate(taskIdValidation),
  taskController.getTaskByIdForAdmin,
);

/**
 * @swagger
 * /api/projects/tasks/{projectId}/admin/tasks/{id}:
 *   put:
 *     summary: Update any task (admin scoped)
 *     tags: [Admin]
 */
router.put(
  "/tasks/:id",
  validate(taskIdValidation),
  taskController.updateTaskForAdmin,
);

/**
 * @swagger
 * /api/projects/tasks/{projectId}/admin/tasks/{id}:
 *   delete:
 *     summary: Delete any task (admin scoped)
 *     tags: [Admin]
 */
router.delete(
  "/tasks/:id",
  validate(taskIdValidation),
  taskController.deleteTaskForAdmin,
);

export default router;
