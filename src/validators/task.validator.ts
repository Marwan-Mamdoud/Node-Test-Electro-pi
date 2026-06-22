import { body, param } from "express-validator";

export const createTaskValidation = [
  param("projectId").isUUID().withMessage("Invalid project ID"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  body("status")
    .optional()
    .isIn(["pending", "in_progress", "done"])
    .withMessage("Status must be pending, in_progress, or done"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),
];

export const updateTaskValidation = [
  param("projectId").isUUID().withMessage("Invalid project ID"),
  param("id").isUUID().withMessage("Invalid task ID"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),

  body("status")
    .optional()
    .isIn(["pending", "in_progress", "done"])
    .withMessage("Status must be pending, in_progress, or done"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
];

export const taskIdValidation = [
  param("projectId").isUUID().withMessage("Invalid project ID"),
  param("id").isUUID().withMessage("Invalid task ID"),
];

export const taskFilterValidation = [
  param("projectId").isUUID().withMessage("Invalid project ID"),

  body("status")
    .optional()
    .isIn(["pending", "in_progress", "done"])
    .withMessage("Status must be pending, in_progress, or done"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
];
