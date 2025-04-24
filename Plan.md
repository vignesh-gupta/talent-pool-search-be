# Talent Pool Search Engine - Full-Stack System Design

---

## 1. Product Overview & Requirements

### Features

- **Advanced Search Filters**: Filter candidates by skills, years of experience, location and availability.
- **Profile Viewing**: View detailed professional profiles.
- **Saved Searches**: Allow users to save and re-run their search queries.
- **Collection**: Save candidates for future reference.
- **Role-based Access**: Different permissions for recruiters, hiring managers, and candidates.
- **Pagination / Infinite Scroll**: Navigate large result sets efficiently.

### User Personas

- **Recruiters**: Search and filter candidates, save profiles, manage pipelines.
- **Hiring Managers**: Review candidate profiles, provide feedback.
- **Candidates**: Create/Update self profile, set availability, Apply for jobs (Considering like a job portal)

### Functional Requirements

- Fast and accurate search results.
- Real-time availability filters.
- Location-based and fuzzy search capabilities.

### Non-functional Requirements

- Scalability: Handle large datasets (millions of profiles).
- High availability: 99% uptime.
- Responsiveness: Sub-second response times for searches.
- Security: Data privacy and access control.
- Easy to use: Mobile Responsive Design.

---

## 2. Full-Stack Architecture

### High-Level Overview

- **Frontend (Next.js)**
- **Backend (Node.js/Express or Hono)**
- **Database (MongoDB)**
- **Search Layer (MongoDB Atlas Search)**
- **Cache Layer (Redis)**
- **Authentication (Auth.js)**
- **Object Storage (AWS S3)**

### Architectural Flow

```
User -> Frontend (Next.js) -> Object Fetch from CDN (profile images, CVs)
                           -> Backend API (Express/Hono) -> Redis (for read-through cache) -> MongoDB (with search layer)
                                                         -> Auth Provider
                                                         -> Object Storage with S3 (profile images, CVs)
```

### App Structure

- **Frontend**: Modular components, hooks, SSR for SEO-friendly search results.
- **Backend**: Microservices or modular monolith with distinct services for auth, search, profiles, etc.

---

## 3. MongoDB Data Modeling & Indexing

### Data Model: `profiles`

Model file:

```js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
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

userSchema.index({ location: "2dsphere" });
userSchema.index({ "skills.name": 1, "skills.experience": -1 });
userSchema.index({ name: "text", "skills.name": "text" });

const User = mongoose.model("User", userSchema);

module.exports = User;
```

Json Example

```json
{
  _id: ObjectId,
  name: "Vignesh Gupta",
  email: "vighneshgupta32@gmail.com",
  location: { type: "Point", coordinates: [longitude, latitude] },
  skills: [
    { name: "JavaScript", experience: 4 },
    { name: "TypeScript", experience: 3 },
    { name: "Docker", experience: 2 },
    { name: "React", experience: 3 },
    { name: "Node.js", experience: 2 },
    { name: "Redis", experience: 2 },
    { name: "MongoDB", experience: 2 }
    { name: "PostgreSQL", experience: 3 },
    { name: "AWS", experience: 2 },
  ],
  experience: [
    { company: "HCLTech", role: "SDE", years: 3.5, description: "Worked on various projects" },
    { company: "HCLTech", role: "Intern", years: 0.5, description: "Internship in software development" }
  ],
  availability: { from: "2025-04-01", to: "2025-10-01" },
  last_active: ISODate,
  created_at: ISODate
}
```

### Indexes

- **Compound Index**: `{ "skills.name": 1, "skills.experience": -1 }`
- **Text Index**: `{ name: "text", "skills.name": "text" }`
- **Geo Index**: `{ location: "2dsphere" }`

### Schema Strategy

- **Embed skills and availability** for fast reads.
- **Reference companies** (if there's a centralized `companies` collection)

### Schema Evolution

- Use schema versioning (e.g., `schema_version` field).
- Backfill data during migrations with background jobs.

---

## 4. Querying & Aggregation

### Query: Candidates with minimum years in a skill

```js
{ "skills": { $elemMatch: { name: "React", experience: { $gte: 3 } } } }
```

### Query: Candidates available within a date range

```js
{ "availability.from": { $lte: ISODate("2025-05-01") }, "availability.to": { $gte: ISODate("2025-05-01") } }
```

### Query: Nearby candidates with fuzzy skill match

```js
{
  $and: [
    {
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 50000,
        },
      },
    },
    { $text: { $search: "React" } },
  ];
}
```

---

## 5. Search & Ranking Logic

### Search Implementation

- MongoDB Atlas Search with analyzers.
- Autocomplete, typo-tolerance using fuzzy search.

### Ranking Algorithm (score = weighted sum)

- Skill Match (%): 50%
- Years of Experience: 30%
- Recency of Activity: 20%

```
Score = Skill Match (%) * 0.5 + Years of Experience * 0.3 + Recency of Activity * 0.2
```

### Pagination

- Use **`skip`/`limit`** for basic pagination.
- **Infinite Scroll** with `created_at` or `last_active` as cursor for better performance (`last_active` preferred to keep people active on the platform).

---

## 6. API Design & Security

### REST APIs

- `GET /profiles/search?skills=react&location=bangalore`
- `GET /profiles/:id`
- `POST /saved-searches`
- `GET /saved-searches`
- `DELETE /saved-searches/:id`
- `GET /saved-profiles`
- `POST /auth/login` - Fetch JWT token (not needed in case of API token auth)

### Auth

- JWT for session management.
- OAuth2 for integrations (e.g., with ATS systems).
- Role-based access control: recruiter, admin, candidate.

### Security Measures

- Rate-limiting via Redis buckets.
- Input sanitization & validation with libraries like `zod`.
- CORS for trusted domains only
- HTTPS for secure communication.

---

## 7. Frontend UI/UX Considerations

### Search Interface

- Smart filters (multi-select dropdowns for skills, input/slider for experience, date pickers for availability).
- Skill chips/tags for quick filtering.
- Map integration for location-based search.

### Profile View

- Card layout with expandable details.
- Highlighted skill match %.
- Buttons to save/bookmark profile.

### Saved Search Page

- List saved searches with last run time.
- Option to edit, delete, or re-run.

---

## 8. Extensibility

### Future Features

- **Recommendation Engine**: Based on historical recruiter activity.
- **Alerts**: Email or in-app notifications for saved searches
- **Messaging**: In-app chat or contact feature. (Use a MQ like RabbitMQ or Kafka for async processing)

#### Extensibility Strategy
- Use microservices architecture for independent scaling and deployment of new features.
- Implement feature flags for gradual rollout of new features.
- Use a plugin architecture for third-party integrations (e.g., ATS, CRM tools).

### Multi-tenancy Support

- Add `tenant_id` to every resource (if using a shared DB).
- Isolate data by organization using middleware.
- Use shared or separate DB strategies depending on scale.
- Use a separate database for each organization if data isolation is critical.