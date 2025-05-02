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
      skills,
      skillsMinExp,
      availableBy,
      location,
      company,
    });


    query.forEach((q) => {
      console.log(JSON.stringify(q.$addFields));
      
    })


    const { data, hasNext, hasPrev, total } = await getProfiles(
      query,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      total,
      page: page || 1,
      hasNext,
      hasPrev,
      data,
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
