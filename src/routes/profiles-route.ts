import express from "express";
import { getConnection } from "../configs/db";
import { Profile, profileSchema } from "../schemas/profile";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API is running",
  });
});

router.get("/search", async (req, res) => {
  const { skills, skillsMinExp, workExp, location, company } = req.query;

  const query: any = {};

  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : skills.toString().split(",");
    const minExpArray = Array.isArray(skillsMinExp) ? skillsMinExp : skillsMinExp?.toString().split(",") || [];

    query.skills = {
      $all: skillsArray.map((skill, index) => ({
        $elemMatch: {
          name: { $regex: skill, $options: "i" }, // Case-insensitive fuzzy search
          experience: { $gte: minExpArray[index] || 0 }, // Use corresponding minExp or default to 0
        },
      })),
    };
  }

  console.log({ query: JSON.stringify(query) });

  const profiles = await Profile.find(query).limit(50)

  return res.status(200).json({
    success: true,
    message: "Profiles fetched successfully",
    data: profiles,
  });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const profile = await Profile.findById(id);

  return res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: profile,
  });
});
export default router;
