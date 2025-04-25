import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { Profile } from "../src/schemas/profile";



const NUM_PROFILES = 10000;

async function connectDB() {
  await mongoose.connect("mongodb+srv://dbuser:6Ibi5jpvbM7yEuBQ@cluster0.ewh6dwx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
  console.log("Connected to MongoDB");
}

const techSkills = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust", "Ruby", "Kotlin",
  "React.js", "Next.js", "Angular", "Vue.js", "Svelte", "SolidJS", "React Native", "Flutter", "Ionic", "Expo",
  "Node.js", "Express.js", "Spring Boot", ".NET Core", "Django", "Flask", "FastAPI", "Ruby on Rails", "Laravel", "NestJS",
  "HTML5", "CSS3", "Sass", "Less", "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "Styled Components", "Emotion",
  "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis", "Cassandra", "DynamoDB", "Firebase Realtime DB", "Firestore", "Neo4j",
  "AWS", "Azure", "Google Cloud Platform", "Heroku", "Vercel", "Netlify", "Docker", "Kubernetes", "Terraform", "Ansible",
  "Git", "GitHub", "GitLab", "Bitbucket", "CI/CD", "Jenkins", "CircleCI", "Travis CI", "GitHub Actions", "Azure DevOps",
  "Webpack", "Vite", "Rollup", "Parcel", "Babel", "ESLint", "Prettier", "Storybook", "Jest", "Mocha",
  "Cypress", "Selenium", "Playwright", "Puppeteer", "Postman", "Insomnia", "Swagger", "OpenAPI", "GraphQL", "RESTful APIs",
  "Kafka", "RabbitMQ", "gRPC", "WebSockets", "OAuth2", "JWT", "Stripe API", "Twilio API", "Algolia", "ElasticSearch"
];

function generateSkills() {
  return Array.from({ length: faker.number.int({ min: 3, max: 7 }) }, () => ({
    name: techSkills[faker.number.int({ min: 0, max: techSkills.length - 1 })],
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
