import mongoose, { Schema } from "mongoose";

const searchesSchema = new Schema({
  title: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  skills: [
    {
      name: { type: String },
      experience: { type: Number },
    },
  ],
  company: { type: String },
  availableBy: { type: Date },
  url: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

searchesSchema.index({ name: "text", "skills.name": "text" });
searchesSchema.index({ name: "text", "experience.company": "text" });
searchesSchema.index({ name: "text", title: "text" });

export const SearchesModel = mongoose.model("Search", searchesSchema);
