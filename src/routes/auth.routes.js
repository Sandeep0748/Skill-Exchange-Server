const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.post(
  "/register",
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email")
      .isEmail()
      .withMessage("Valid email required"),
    body("phone")
      .matches(/^[0-9]{10,15}$/)
      .withMessage("Valid phone number required (10-15 digits)"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.register
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email required"),
    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validate,
  authController.login
);

// Protected routes
router.get("/profile", auth, authController.getProfile);

router.put(
  "/profile",
  auth,
  [
    body("name")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("bio")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Bio cannot exceed 500 characters"),
    body("phone")
      .optional()
      .matches(/^[0-9]{10,15}$/)
      .withMessage("Valid phone number required"),
  ],
  validate,
  authController.updateProfile
);

router.post("/logout", auth, authController.logout);

module.exports = router;
