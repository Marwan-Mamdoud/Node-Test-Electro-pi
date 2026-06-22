import { body, param } from "express-validator";

export const createProjectValidation = [
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
    .isIn(["active", "archived", "completed"])
    .withMessage("Status must be active, archived, or completed"),
];

export const updateProjectValidation = [
  param("id").isUUID().withMessage("Invalid project ID"),

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
    .isIn(["active", "archived", "completed"])
    .withMessage("Status must be active, archived, or completed"),
];

export const projectIdValidation = [
  param("id").isUUID().withMessage("Invalid project ID"),
];
