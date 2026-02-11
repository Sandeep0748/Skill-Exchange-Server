const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const requestController = require("../controllers/request.controller");

const router = express.Router();

// All request routes are protected
router.use(auth);

// Get all requests for current user (with optional filters)
router.get("/", requestController.getMyRequests);

// Get specific request by ID
router.get("/:id", requestController.getRequestById);

// Create new request
router.post(
  "/",
  [
    body("skillId")
      .notEmpty()
      .withMessage("Skill ID is required"),
    body("message")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Message cannot exceed 500 characters"),
  ],
  validate,
  requestController.createRequest
);

// Update request status (accept, reject, complete)
router.patch(
  "/:id/status",
  [
    body("status")
      .isIn(["Accepted", "Rejected", "Completed"])
      .withMessage("Invalid status"),
  ],
  validate,
  requestController.updateRequestStatus
);

// Cancel pending request
router.delete("/:id", requestController.cancelRequest);

// Get all requests for a specific skill (only skill owner)
router.get("/skill/:skillId", requestController.getSkillRequests);

module.exports = router;
