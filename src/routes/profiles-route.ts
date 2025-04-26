import express from "express";
import { Profile } from "../schemas/profile";

const router = express.Router();

router.get("/search", async (req, res) => {
  const { skills = "", skillsMinExp= "", availableBy, location, company } = req.query;

  const query: any = {};

  if (skills) {
    const skillsArray = Array.isArray(skills)
      ? skills
      : skills.toString().split(",");
    const minExpArray = Array.isArray(skillsMinExp)
      ? skillsMinExp
      : skillsMinExp?.toString().split(",") || [];

    query.skills = {
      $all: skillsArray.map((skill, index) => ({
        $elemMatch: {
          name: { $regex: skill, $options: "i" }, // Case-insensitive fuzzy search
          experience: { $gte: minExpArray[index] || 0 }, // Use corresponding minExp or default to 0
        },
      })),
    };
  }

  // Process company filter - search across the experience array
  if (company) {
    query.experience = {
      $elemMatch: {
        company: { $regex: company, $options: "i" },
      },
    };
  }

  if (availableBy) {
    const availableByDate = new Date(availableBy.toString());

    // { "availability.from": { $lte: ISODate("2025-06-01") }, "availability.to": { $gte: ISODate("2025-06-01") } }
    query["availability.from"] = { $lte: availableByDate }; 
    query["availability.to"] = { $gte: availableByDate };   
  }

  console.log(JSON.stringify(query));

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
