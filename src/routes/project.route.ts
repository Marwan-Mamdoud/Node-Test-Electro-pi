import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  createProjectValidation,
  updateProjectValidation,
  projectIdValidation,
} from "../validators/project.validator";
import * as projectController from "../controllers/project.controller";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "Website Redesign"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Redesign company website with modern UI"
 *               status:
 *                 type: string
 *                 enum: [active, archived, completed]
 *                 default: active
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Project' }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", validate(createProjectValidation), projectController.create);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects for authenticated user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Project' }
 *                     total: { type: integer, example: 50 }
 *                     page: { type: integer, example: 1 }
 *                     totalPages: { type: integer, example: 5 }
 *       401:
 *         description: Unauthorized
 */
router.get("/", projectController.getAll);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a single project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Project' }
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", validate(projectIdValidation), projectController.getOne);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project details
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *                 maxLength: 255
 *                 example: "Updated Title"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               status:
 *                 type: string
 *                 enum: [active, archived, completed]
 *                 example: "completed"
 *     responses:
 *       200:
 *         description: Project updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", validate(updateProjectValidation), projectController.update);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Project deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message: { type: string, example: "Project deleted successfully" }
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", validate(projectIdValidation), projectController.remove);

export default router;
