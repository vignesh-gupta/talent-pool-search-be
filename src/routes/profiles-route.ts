import express from "express";
import { Profile } from "../schemas/profile";
import { formulateQuery, getProfiles } from "../services/profile-services";
import { z } from "zod";
import { validateDate } from "../utils/validation";
import { validateData } from "../middlewares/validationMiddleware";
import { profileSearchSchema } from "../utils/zod";

const router = express.Router();

router.get("/search", validateData(profileSearchSchema), async (req, res) => {
  try {
    const {
      skills,
      skillsMinExp,
      availableBy,
      location,
      company,
      page,
      limit,
    } = profileSearchSchema.parse(req.query);

    if (availableBy && !validateDate(availableBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for availableBy",
      });
    }

    const query = formulateQuery({
      skills: skills ? decodeURIComponent(skills) : undefined,
      skillsMinExp: skillsMinExp ? decodeURIComponent(skillsMinExp) : undefined,
      availableBy: availableBy ? decodeURIComponent(availableBy) : undefined,
      location: location ? decodeURIComponent(location) : undefined,
      company: company ? decodeURIComponent(company) : undefined,
    });

    console.log(JSON.stringify(query));

    const profiles = await getProfiles(query, page, limit);

    return res.status(200).json({
      success: true,
      message: "Profiles fetched successfully",
      total: profiles.length,
      page: page || 1,
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

    const profile = await Profile.findById(id);

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
