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
