import mongoose, { Schema } from "mongoose";

const skillSchema = new Schema({
  name: { type: String, required: true },
  experience: { type: Number, required: true },
});

const experienceSchema = new Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  years: { type: Number, required: true },
  description: { type: String, required: true },
});

export const profileSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  skills: [skillSchema],
  experience: [experienceSchema],
  availability: {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
  },
  last_active: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

profileSchema.index({ location: "2dsphere" });
profileSchema.index({ name: "text", "skills.name": "text" });
profileSchema.index({ "skills.name": 1, "skills.experience": -1 });

export const ProfileModel = mongoose.model("Profile", profileSchema);
