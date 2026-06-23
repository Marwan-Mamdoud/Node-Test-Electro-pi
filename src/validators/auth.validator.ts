import { body, param } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password").trim().notEmpty().withMessage("Password is required"),
];

export const userIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isUUID()
    .withMessage("Invalid user ID format"),
];

export const updateRoleValidation = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isUUID()
    .withMessage("Invalid user ID format"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["member", "admin"])
    .withMessage("Role must be either 'member' or 'admin'"),
];

export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email must not exceed 255 characters"),
];

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one letter and one number",
    ),
];
