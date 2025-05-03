import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { ProfileModel } from "../src/schemas/profile";
import { connectDB } from "../src/configs/db";

const NUM_PROFILES = 10000;

const techSkills = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "Go",
  "Rust",
  "Ruby",
  "Kotlin",
  "React.js",
  "Next.js",
  "Angular",
  "Vue.js",
  "Svelte",
  "SolidJS",
  "React Native",
  "Flutter",
  "Ionic",
  "Expo",
  "Node.js",
  "Express.js",
  "Spring Boot",
  ".NET Core",
  "Django",
  "Flask",
  "FastAPI",
  "Ruby on Rails",
  "Laravel",
  "NestJS",
  "HTML5",
  "CSS3",
  "Sass",
  "Less",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Chakra UI",
  "Styled Components",
  "Emotion",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "SQLite",
  "Redis",
  "Cassandra",
  "DynamoDB",
  "Firebase Realtime DB",
  "Firestore",
  "Neo4j",
  "AWS",
  "Azure",
  "Google Cloud Platform",
  "Heroku",
  "Vercel",
  "Netlify",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Git",
  "GitHub",
  "GitLab",
  "Bitbucket",
  "CI/CD",
  "Jenkins",
  "CircleCI",
  "Travis CI",
  "GitHub Actions",
  "Azure DevOps",
  "Webpack",
  "Vite",
  "Rollup",
  "Parcel",
  "Babel",
  "ESLint",
  "Prettier",
  "Storybook",
  "Jest",
  "Mocha",
  "Cypress",
  "Selenium",
  "Playwright",
  "Puppeteer",
  "Postman",
  "Insomnia",
  "Swagger",
  "OpenAPI",
  "GraphQL",
  "RESTful APIs",
  "Kafka",
  "RabbitMQ",
  "gRPC",
  "WebSockets",
  "OAuth2",
  "JWT",
  "Stripe API",
  "Twilio API",
  "Algolia",
  "ElasticSearch",
];

function generateSkills() {

  // Generate a random number of skills between 1 and 7 with random experience between 1 and 10 years
  // no duplicates

  const uniqueSkills = new Set();
  const skillsCount = faker.number.int({ min: 1, max: 7 });
  while (uniqueSkills.size < skillsCount) {
    const randomSkill = techSkills[faker.number.int({ min: 0, max: techSkills.length - 1 })];
    uniqueSkills.add(randomSkill);
  }

  return Array.from(uniqueSkills).map((skill) => ({
    name: skill,
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
  const from = faker.date.past({ years: 0.3 });
  const to = faker.date.future({ years: 0.3 });
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
  }

  await ProfileModel.insertMany(bulkProfiles);
  console.log(`Inserted ${NUM_PROFILES} profiles`);
  bulkProfiles.length = 0; // clear array

  console.log("✅ Seeding complete!");
  mongoose.disconnect();
  process.exit(0);
}

seedDB().catch(console.error);
