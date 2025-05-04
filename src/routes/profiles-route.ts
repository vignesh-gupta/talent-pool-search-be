import express from "express";
import { ProfileModel } from "../schemas/profile";
import {
  formulateQuery,
  getProfiles,
  ISkill,
} from "../services/profile-services";
import { validateDate } from "../utils/validation";
import {
  profileDataSchema,
  profileIdSchema,
  profileSearchSchema,
} from "../utils/zod";
import { getLocation } from "../utils/location";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { success, data, error } = profileDataSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile data",
        error: error.errors,
      });
    }

    const { name, email, location, skills, experience, availableBy } = data;

    const newProfile = new ProfileModel({
      name,
      email,
      location: {
        type: "Point",
        coordinates: [location.lon, location.lat],
      },
      skills,
      experience,
      availableBy,
      last_active: new Date(),
    });

    await newProfile.save();

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: newProfile,
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/search", async (req, res) => {
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
    const skillsMinExpArray = skillsMinExp.split(",");

    if (skillsMinExpArray.length > skillsArray.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        error: "skillsMinExp should not be more than skills",
      });
    }

    const requiredSkills: ISkill[] | undefined =
      skillsArray?.map((skill, i) => ({
        name: skill.trim(),
        minExperience: skillsMinExpArray ? parseInt(skillsMinExpArray[i]) : 0,
      })) || undefined;

    const locationDetails = location ? await getLocation(location) : undefined;

    const query = formulateQuery({
      skills: requiredSkills,
      availableBy,
      location: locationDetails,
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
    const { success, data } = profileIdSchema.safeParse(req.params);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID",
      });
    }

    const { id } = data;

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
