import { Router } from "express";

import { SearchesModel } from "../schemas/search";

import { searchDataSchema } from "../utils/zod/searches";
import { IdSchema } from "../utils/zod";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const { success, data } = IdSchema.safeParse(req.params);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const searchData = await SearchesModel.findById(data.id);

    if (!searchData) {
      return res.status(404).json({
        success: false,
        message: "Search data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Search data retrieved successfully",
      data: searchData,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { success, data } = searchDataSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }

    const { title, skills, availableBy, company, location } = data;

    let searchUrl = `${process.env.BASE_URL}/api/v1/profiles/search?`;

    if (skills && skills.length > 0) {
      const skillsArray = skills.map((skill) => skill.name).join(",");
      const skillsMinExp = skills.map((skill) => skill.experience).join(",");
      searchUrl += `skills=${skillsArray}&skillsMinExp=${skillsMinExp}`;
    }

    if (company) searchUrl += `&company=${company}`;

    if (location) searchUrl += `&location=${location}`;

    if (availableBy) searchUrl += `&availableBy=${availableBy}`;

    const searchData = new SearchesModel({
      title,
      location,
      skills,
      availableBy,
      url: searchUrl,
    });

    await searchData.save();

    return res.status(200).json({
      success: true,
      message: "Saved search successfully",
      url: searchUrl,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
