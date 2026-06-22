import { Router } from "express";
import { authenticate } from "../middleware/auth";
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
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   post:
 *     summary: Create a new task under a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Design homepage"
 *               description:
 *                 type: string
 *                 example: "Create homepage mockup"
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *                 default: pending
 *                 example: "pending"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *                 example: "high"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-15"
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Task' }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.post("/", validate(createTaskValidation), taskController.create);

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   get:
 *     summary: Get all tasks for a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, in_progress, done] }
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *         description: Filter by priority
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Task' }
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     totalPages: { type: integer }
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, taskController.getAll);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Task' }
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", validate(taskIdValidation), taskController.getOne);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated task title"
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, done]
 *                 example: "in_progress"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: "medium"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-20"
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", validate(updateTaskValidation), taskController.update);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Task deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message: { type: string, example: "Task deleted successfully" }
 *       404:
 *         description: Task not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", validate(taskIdValidation), taskController.remove);

export default router;
