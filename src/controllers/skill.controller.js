const Skill = require("../models/Skill.model");
const mongoose = require("mongoose");

exports.createSkill = async (req, res, next) => {
  try {
    const { category, title, description, experienceLevel, availability } =
      req.body;

    const skill = await Skill.create({
      userId: req.user.userId,
      category,
      title,
      description,
      experienceLevel,
      availability,
    });

    // Populate user info before sending response
    await skill.populate("userId", "name email phone");

    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      skill,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSkills = async (req, res, next) => {
  try {
    const { category, experienceLevel } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    const skills = await Skill.find(filter)
      .populate("userId", "name email phone profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSkillById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    const skill = await Skill.findById(id).populate(
      "userId",
      "name email phone profileImage bio"
    );

    if (!skill || !skill.isActive) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.json({
      success: true,
      skill,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserSkills = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const skills = await Skill.find({
      userId,
      isActive: true,
    }).populate("userId", "name email phone profileImage");

    res.json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, title, description, experienceLevel, availability } =
      req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    // Find skill and check ownership
    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Check if user owns the skill
    if (skill.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this skill",
      });
    }

    // Update fields
    const updateData = {};
    if (category) updateData.category = category;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (experienceLevel) updateData.experienceLevel = experienceLevel;
    if (availability) updateData.availability = availability;

    const updatedSkill = await Skill.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("userId", "name email phone profileImage");

    res.json({
      success: true,
      message: "Skill updated successfully",
      skill: updatedSkill,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID",
      });
    }

    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    // Check if user owns the skill
    if (skill.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this skill",
      });
    }

    // Soft delete - mark as inactive
    skill.isActive = false;
    await skill.save();

    res.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.searchSkills = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const skills = await Skill.find(
      {
        isActive: true,
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
        ],
      },
      { score: { $meta: "textScore" } }
    )
      .populate("userId", "name email phone profileImage")
      .sort({ score: { $meta: "textScore" } });

    res.json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};
