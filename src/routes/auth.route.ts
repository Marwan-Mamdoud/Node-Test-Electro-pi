import { Router } from "express";
import {
  register,
  login,
  logout,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  getMe,
  updateProfile,
  updatePassword,
  adminUpdateUser,
} from "../controllers/auth.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  registerValidation,
  loginValidation,
  userIdValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "../validators/auth.validator";

const router = Router();

/* ---------------- REGISTER ---------------- */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post("/register", validate(registerValidation), register);

/* ---------------- LOGIN ---------------- */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and get JWT token
 *     tags: [Auth]
 */
router.post("/login", validate(loginValidation), login);

/* ---------------- LOGOUT ---------------- */
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and invalidate token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post("/logout", authenticate, logout);

/* ---------------- ME ---------------- */
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.get("/me", authenticate, getMe);

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/me",
  authenticate,
  validate(updateProfileValidation),
  updateProfile,
);

/**
 * @swagger
 * /api/auth/me/password:
 *   put:
 *     summary: Update current user password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/me/password",
  authenticate,
  validate(changePasswordValidation),
  updatePassword,
);

/* ---------------- ADMIN AREA (REAL PATH = /api/auth/*) ---------------- */

router.use(authenticate);
router.use(authorize("admin"));

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/users", getAllUsers);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Admin]
 */
router.get("/users/:id", validate(userIdValidation), getUserById);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Admin]
 */
router.delete("/users/:id", validate(userIdValidation), deleteUser);

/**
 * @swagger
 * /api/auth/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 */
router.patch("/users/:id/role", validate(userIdValidation), updateUserRole);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   put:
 *     summary: Update any user (admin only)
 *     tags: [Admin]
 */
router.put("/users/:id", validate(updateProfileValidation), adminUpdateUser);

export default router;
