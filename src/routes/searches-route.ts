import { Router } from "express";

import { SearchesModel } from "../schemas/search";

import { searchDataSchema, searchGetSchema } from "../utils/zod/searches";
import { IdSchema } from "../utils/zod";
import logger from "../utils/logger";
import { generateSearchTitle } from "../utils/gen-search-title";
import { generateSearchURL } from "../utils/gen-search-url";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { success, data } = searchGetSchema.safeParse(req.query);

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination data",
      });
    }

    const { page, limit, q } = data;

    const query = q ? { title: { $regex: q, $options: "i" } } : {};

    const searchData = await SearchesModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await SearchesModel.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: searchData,
      hasNextPage: total > page * limit,
      hasPreviousPage: page > 1,
    });
  } catch (error: any) {
    console.error("Error fetching search data", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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

    const searchTitle = generateSearchTitle(data);
    const searchUrl = generateSearchURL(data);

    const searchData = new SearchesModel({
      ...data,
      title: searchTitle,
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
