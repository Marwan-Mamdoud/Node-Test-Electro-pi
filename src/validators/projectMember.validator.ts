import { param, body } from "express-validator";

export const addMemberValidation = [
  param("id").isUUID().withMessage("Invalid project ID"),
  body("userId")
    .optional()
    .isUUID()
    .withMessage("Invalid user ID format"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body()
    .custom((value) => {
      if (!value.userId && !value.email) {
        throw new Error("Either userId or email is required");
      }
      if (value.userId && value.email) {
        throw new Error("Provide only userId or email, not both");
      }
      return true;
    }),
];

export const removeMemberValidation = [
  param("id").isUUID().withMessage("Invalid project ID"),
  param("userId").isUUID().withMessage("Invalid user ID format"),
];

export const projectIdParamValidation = [
  param("id").isUUID().withMessage("Invalid project ID"),
];
