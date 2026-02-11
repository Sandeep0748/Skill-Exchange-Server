const Request = require("../models/Request.model");
const mongoose = require("mongoose");
const Skill = require("../models/Skill.model");

exports.createRequest = async (req, res, next) => {
  try {
    const { skillId, message } = req.body;
    const fromUserId = req.user.userId;

    // Validate skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Prevent user from requesting their own skill
    if (skill.userId.toString() === fromUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot request your own skill",
      });
    }

    // Check if request already exists
    const existingRequest = await Request.findOne({
      skillId,
      fromUserId,
      status: "Pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this skill",
      });
    }

    const request = await Request.create({
      skillId,
      fromUserId,
      toUserId: skill.userId,
      message: message || "",
    });

    // Populate relations before returning
    await request.populate([
      { path: "skillId", select: "title category" },
      { path: "fromUserId", select: "name email phone" },
      { path: "toUserId", select: "name email phone" },
    ]);

    res.status(201).json({
      success: true,
      message: "Request sent successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status, type } = req.query;

    // Build filter
    const filter = {};

    // Type: 'sent' for requests user made, 'received' for requests user received
    if (type === "sent") {
      filter.fromUserId = userId;
    } else if (type === "received") {
      filter.toUserId = userId;
    } else {
      // Both sent and received
      filter.$or = [{ fromUserId: userId }, { toUserId: userId }];
    }

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }

    const requests = await Request.find(filter)
      .populate({
        path: "skillId",
        select: "title category description experienceLevel",
      })
      .populate({
        path: "fromUserId",
        select: "name email phone profileImage",
      })
      .populate({
        path: "toUserId",
        select: "name email phone profileImage",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    const request = await Request.findById(id)
      .populate({
        path: "skillId",
        select: "title category description experienceLevel",
      })
      .populate({
        path: "fromUserId",
        select: "name email phone profileImage",
      })
      .populate({
        path: "toUserId",
        select: "name email phone profileImage",
      });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.json({
      success: true,
      request,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    // Validate status
    if (!["Accepted", "Rejected", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Get request with skill details
    const request = await Request.findById(id).populate("skillId");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Authorization: Only skill owner can accept/reject
    if (
      ["Accepted", "Rejected"].includes(status) &&
      request.toUserId.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this request",
      });
    }

    // Authorization: Only requester can mark as completed
    if (status === "Completed" && request.fromUserId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the requester can mark this as completed",
      });
    }

    // Validate state transitions
    if (status === "Completed" && request.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted requests can be marked as completed",
      });
    }

    // Cannot change status if already rejected or completed
    if (["Rejected", "Completed"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${request.status.toLowerCase()} request`,
      });
    }

    request.status = status;
    await request.save();

    await request.populate([
      { path: "skillId", select: "title category" },
      { path: "fromUserId", select: "name email phone" },
      { path: "toUserId", select: "name email phone" },
    ]);

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only requester can cancel their request
    if (request.fromUserId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own requests",
      });
    }

    // Can only cancel pending requests
    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${request.status.toLowerCase()} request`,
      });
    }

    await Request.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Request cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getSkillRequests = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    // Verify user owns the skill
    const skill = await Skill.findById(skillId);
    if (!skill || skill.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view requests for your own skills",
      });
    }

    const requests = await Request.find({ skillId })
      .populate({
        path: "fromUserId",
        select: "name email phone profileImage",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};
