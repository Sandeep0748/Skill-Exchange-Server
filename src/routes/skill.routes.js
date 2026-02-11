const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const skillController = require("../controllers/skill.controller");

const router = express.Router();

// Public routes
router.get("/", skillController.getAllSkills);

router.get("/search", skillController.searchSkills);

router.get("/user/:userId", skillController.getUserSkills);

router.get("/:id", skillController.getSkillById);

// Protected routes
router.post(
  "/",
  auth,
  [
    body("category")
      .notEmpty()
      .withMessage("Category is required"),
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    body("description")
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("experienceLevel")
      .isIn(["Beginner", "Intermediate", "Expert"])
      .withMessage("Invalid experience level"),
  ],
  validate,
  skillController.createSkill
);

router.put(
  "/:id",
  auth,
  [
    body("category")
      .optional()
      .notEmpty()
      .withMessage("Category cannot be empty"),
    body("title")
      .optional()
      .isLength({ min: 3 })
      .withMessage("Title must be at least 3 characters"),
    body("description")
      .optional()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("experienceLevel")
      .optional()
      .isIn(["Beginner", "Intermediate", "Expert"])
      .withMessage("Invalid experience level"),
  ],
  validate,
  skillController.updateSkill
);

router.delete("/:id", auth, skillController.deleteSkill);

module.exports = router;
