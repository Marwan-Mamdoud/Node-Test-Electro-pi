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
    .isIn(["TODO", "IN_PROGRESS", "DONE"])
    .withMessage("Status must be TODO, IN_PROGRESS, or DONE"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("assigneeId")
    .optional()
    .isUUID()
    .withMessage("assigneeId must be a valid UUID"),

  body("creatorId")
    .optional()
    .custom(() => {
      throw new Error(
        "creatorId is set automatically from the authenticated user and cannot be provided",
      );
    }),
];

export const updateTaskValidation = [
  param("projectId").isUUID().withMessage("Invalid project ID"),
  param("id").isUUID().withMessage("Invalid task ID"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),

  body("status")
    .optional()
    .isIn(["TODO", "IN_PROGRESS", "DONE"])
    .withMessage("Status must be TODO, IN_PROGRESS, or DONE"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  body("assigneeId")
    .optional()
    .isUUID()
    .withMessage("assigneeId must be a valid UUID"),

  body("creatorId")
    .optional()
    .custom(() => {
      throw new Error(
        "creatorId cannot be changed after task creation",
      );
    }),
];

export const taskIdValidation = [
  param("projectId").isUUID().withMessage("Invalid project ID"),
  param("id").isUUID().withMessage("Invalid task ID"),
];

export const taskFilterValidation = [
  param("projectId").isUUID().withMessage("Invalid project ID"),
];
