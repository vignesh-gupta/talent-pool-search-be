import express from "express";
import { ProfileModel } from "../schemas/profile";
import {
  formulateQuery,
  getProfiles,
  ISkill,
} from "../services/profile-services";
import { z } from "zod";
import { validateDate } from "../utils/validation";
import { validateData } from "../middlewares/validationMiddleware";
import { profileSearchSchema } from "../utils/zod";
import logger from "../utils/logger";

const router = express.Router();

router.get("/search", validateData(profileSearchSchema), async (req, res) => {
  try {
    const { success, data, error } = profileSearchSchema.safeParse(req.query);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        error: error.errors,
      });
    }
    const {
      skills,
      skillsMinExp,
      availableBy,
      location,
      company,
      page,
      limit,
    } = data;

    if (availableBy && !validateDate(availableBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for availableBy",
      });
    }

    const skillsArray = skills.split(",");
    const skillsMinExpArray = skillsMinExp.split(",")

    const requiredSkills: ISkill[] | undefined =
      skillsArray?.map((skill, i) => ({
        name: skill.trim(),
        minExperience: skillsMinExpArray ? parseInt(skillsMinExpArray[i]) : 0,
      })) || undefined;

    const query = formulateQuery({
      skills: requiredSkills,
      availableBy,
      location,
      company,
    });

    const {
      data: profiles,
      hasNext,
      hasPrev,
      total,
      dataLength,
    } = await getProfiles(query, page, limit);

    return res.status(200).json({
      success: true,
      total,
      page: page || 1,
      hasNext,
      hasPrev,
      dataLength,
      data: profiles,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await ProfileModel.findById(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
export default router;
