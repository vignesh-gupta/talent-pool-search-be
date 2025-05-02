import { Profile } from "../schemas/profile";

export type ProfileQuery = {
  skills?: any;
  company?: any;
  experience?: any;
  availableBy?: any;
  location?: any;
};

export const formulateQuery = ({
  skills,
  skillsMinExp,
  company,
  availableBy,
  location,
}: {
  skills?: string;
  skillsMinExp?: string;
  company?: string;
  availableBy?: string;
  location?: string;
}) => {
  const desiredSkills = skills ? skills.split(",") : [];

  const pipeline = [
    // 1. Handle optional skills field
    {
      '$addFields': {
        'years_of_experience': {
          '$sum': '$experience.years'
        }, 
      }
    }
    // 2. Calculate skill match percent (safe fallback)
    // {
    //   $addFields: {
    //     skillMatchPercent: {
    //       $cond: [
    //         { $gt: [desiredSkills.length, 0] },
    //         {
    //           $divide: [{ $size: "$matchedSkills" }, desiredSkills.length],
    //         },
    //         0,
    //       ],
    //     },
    //   },
    // },
    // // 3. Sum experience years (safe fallback)
    // {
    //   $addFields: {
    //     totalYearsExp: {
    //       $cond: [
    //         { $isArray: "$experience" },
    //         {
    //           $sum: {
    //             $map: {
    //               input: "$experience",
    //               as: "exp",
    //               in: "$$exp.years",
    //             },
    //           },
    //         },
    //         0,
    //       ],
    //     },
    //   },
    // },
    // 4. Recency score (safe fallback if no last_active)
    // {
    //   $addFields: {
    //     daysSinceActive: {
    //       $cond: [
    //         { $ifNull: ["$last_active", false] },
    //         {
    //           $divide: [
    //             { $subtract: [new Date(), "$last_active"] },
    //             1000 * 60 * 60 * 24,
    //           ],
    //         },
    //         null,
    //       ],
    //     },
    //   },
    // },
    // {
    //   $addFields: {
    //     recencyScore: {
    //       $cond: [
    //         { $ifNull: ["$daysSinceActive", false] },
    //         {
    //           $cond: [
    //             { $gt: ["$daysSinceActive", 90] },
    //             0,
    //             {
    //               $subtract: [1, { $divide: ["$daysSinceActive", 90] }],
    //             },
    //           ],
    //         },
    //         0,
    //       ],
    //     },
    //   },
    // },
    // 5. Final score with weighted average
    // {
    //   $addFields: {
    //     finalScore: {
    //       $add: [
    //         { $multiply: ["$skillMatchPercent", 0.5] },
    //         { $multiply: ["$totalYearsExp", 0.3] },
    //         { $multiply: ["$recencyScore", 0.2] },
    //       ],
    //     },
    //   },
    // },
    // 6. Sort
    // { $sort: { finalScore: -1 } },
    // 7. Output
    // {
    //   $project: {
    //     name: 1,
    //     email: 1,
    //     skillMatchPercent: 1,
    //     totalYearsExp: 1,
    //     recencyScore: 1,
    //     finalScore: 1,
    //   },
    // },
  ];
  return pipeline;
};

export const getProfiles = async (
  pipeline: any[],
  page: number = 1,
  limit: number = 50
) => {
  try {

    const result = await Profile.aggregate(pipeline)
    const profiles = result[0].data;
    const total = result[0].total[0] ? result[0].total[0].count : 0;

    const hasNext = page * limit < total; // Check if there are more pages
    const hasPrev = page > 1; // Check if there is a previous page

    return {
      total, // Total number of matching documents
      hasNext,
      hasPrev,
      data: profiles, // Paginated data
    };
  } catch (error) {
    throw new Error("Error fetching profiles");
  }
};
