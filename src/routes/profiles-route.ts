import express from "express";
import { Profile } from "../schemas/profile";
import { formulateQuery, getProfiles } from "../services/profile-services";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const {
      skills = "",
      skillsMinExp = "",
      availableBy,
      location,
      company,
      page,
      limit,
    } = req.query;

    const query = formulateQuery({
      skills: decodeURIComponent(skills?.toString()),
      skillsMinExp: decodeURIComponent(skillsMinExp?.toString()),
      availableBy: decodeURIComponent(availableBy?.toString()),
      location: decodeURIComponent(location?.toString()),
      company: decodeURIComponent(company?.toString()),
    });

    console.log(JSON.stringify(query));

    const pageNumber = parseInt(page.toString(), 10) || 1;
    const limitNumber = parseInt(limit.toString(), 10) || 50;

    const profiles = await getProfiles(query, pageNumber, limitNumber);

    return res.status(200).json({
      success: true,
      message: "Profiles fetched successfully",
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
      error: error.message,
    });
  }
});
export default router;
