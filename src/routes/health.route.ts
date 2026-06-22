import { Router } from "express";
import { getHealth } from "../controllers/health.controller";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Health
 *   description: System health monitoring
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check system health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     status: { type: string, example: "healthy" }
 *                     uptime: { type: number, example: 45.123 }
 *                     checks:
 *                       type: object
 *                       properties:
 *                         database: { type: boolean, example: true }
 *                         redis: { type: boolean, example: true }
 *                         timestamp: { type: string, format: date-time }
 *       503:
 *         description: System is unhealthy
 */
router.get("/", getHealth);

export default router;
