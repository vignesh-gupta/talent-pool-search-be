import { Router } from "express";
import { searchDataSchema } from "../utils/zod/searches";
import { SearchesModel } from "../schemas/search";

const router = Router();

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
