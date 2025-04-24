import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { Profile } from "../db/schemas/profile";

const MONGO_URI = process.env.DATABASE_URL; // Change to your DB

const NUM_PROFILES = 10000;

async function connectDB() {
  await mongoose.connect(MONGO_URI, {});
  console.log("Connected to MongoDB");
}

function generateSkills() {
  return Array.from({ length: faker.number.int({ min: 3, max: 7 }) }, () => ({
    name: faker.hacker.noun(),
    experience: faker.number.int({ min: 1, max: 10 }),
  }));
}

function generateExperience() {
  return Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
    company: faker.company.name(),
    role: faker.person.jobTitle(),
    years: faker.number.int({ min: 1, max: 5 }),
    description: faker.lorem.sentence(),
  }));
}

function generateLocation() {
  return {
    type: "Point",
    coordinates: [
      parseFloat(faker.location.longitude().toString()),
      parseFloat(faker.location.latitude().toString()),
    ],
  };
}

function generateProfile() {
  const from = faker.date.past({ years: 1 });
  const to = faker.date.future({ years: 1 });
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    location: generateLocation(),
    skills: generateSkills(),
    experience: generateExperience(),
    availability: {
      from,
      to,
    },
    last_active: faker.date.recent({ days: 10 }),
    created_at: faker.date.past({ years: 2 }),
  };
}

async function seedDB() {
  await connectDB();
  const bulkProfiles = [];

  for (let i = 0; i < NUM_PROFILES; i++) {
    bulkProfiles.push(generateProfile());
    if (bulkProfiles.length === 1000) {
      await Profile.insertMany(bulkProfiles);
      console.log(`Inserted ${i + 1} profiles`);
      bulkProfiles.length = 0; // clear array
    }
  }

  if (bulkProfiles.length > 0) {
    await Profile.insertMany(bulkProfiles);
    console.log(`Inserted final ${bulkProfiles.length} profiles`);
  }

  console.log("✅ Seeding complete!");
  mongoose.disconnect();
}

seedDB().catch(console.error);
