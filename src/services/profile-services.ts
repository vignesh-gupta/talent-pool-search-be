import { PipelineStage } from "mongoose";
import { ProfileModel } from "../schemas/profile";
import logger from "../utils/logger";

export type ProfileQuery = {
  skills?: any;
  company?: any;
  experience?: any;
  availableBy?: any;
  location?: any;
};

export type ISkill = {
  name: string;
  minExperience: number;
};

export const formulateQuery = ({
  skills,
  company,
  availableBy,
  location,
}: {
  skills?: ISkill[];
  company?: string;
  availableBy?: string;
  location?: string;
}) => {
  const pipeline: PipelineStage[] = [
    // Add a field to check the match percentage for skills and min experience
    // Check skill_match (if skills are there + min experience) = 1 pt , if skills are there but no min experience = 0.5 pt or 0 pt

    /*
    eg: 
    case 1:
    input: [{ name: "Java", minExperience: 2 }, { name: "Python", minExperience: 3 }]
    Database: [{ name: "Java", experience: 2 }, { name: "Python", experience: 1 }]
    output: skillsMatch = (1+0.5)  = 1.5/ 2 = 0.75

    case 2:
    input: [{ name: "Java", minExperience: 2 }, { name: "Python", minExperience: 3 }]
    Database: [{ name: "Java", experience: 2 }, { name: "Python", experience: 3 }]
    output: skillsMatch = (1+1)  = 2/ 2 = 1
    */
    {
      $addFields: {
        skillsMatch: {
          $divide: [
            {
              $sum: {
                $map: {
                  input: skills, // pass as aggregation variable
                  as: "desiredSkill",
                  in: {
                    $let: {
                      vars: {
                        matchedSkill: {
                          $first: {
                            $filter: {
                              input: "$skills",
                              as: "userSkill",
                              cond: {
                                $eq: [
                                  "$$userSkill.name",
                                  "$$desiredSkill.name",
                                ],
                              },
                            },
                          },
                        },
                      },
                      in: {
                        $cond: {
                          if: { $gt: ["$$matchedSkill", null] }, // skill exists in user
                          then: {
                            $cond: [
                              {
                                $gte: [
                                  "$$matchedSkill.experience",
                                  "$$desiredSkill.minExperience",
                                ],
                              },
                              1,
                              0.5,
                            ],
                          },
                          else: 0,
                        },
                      },
                    },
                  },
                },
              },
            },
            skills.length,
          ],
        },
      },
    },
    {
      $addFields: {
        totalExperience: {
          $sum: {
            $map: {
              input: "$experience",
              as: "useExp",
              in: "$$useExp.years",
            },
          },
        },
      },
    },

    // Add a field to check the recency of the profile (in range 1-0 : 1 for recent,  0 for 90+ days old)
    {
      $addFields: {
        daysSinceActive: {
          $dateDiff: {
            startDate: "$last_active",
            endDate: "$$NOW",
            unit: "day",
          },
        },
      },
    },
    {
      $addFields: {
        recencyScore: {
          $round: [
            {
              $cond: [
                { $lte: ["$daysSinceActive", 90] },
                { $divide: [{ $subtract: [90, "$daysSinceActive"] }, 90] },
                0,
              ],
            },
            2,
          ],
        },
      },
    },
  ];

  pipeline.push({
    $sort: { skillsMatch: -1 },
  });

  return pipeline;
};

export const getProfiles = async (
  pipeline: PipelineStage[],
  page: number,
  limit: number
) => {
  try {
    const total = await ProfileModel.countDocuments();

    const result = await ProfileModel.aggregate(pipeline)
      .limit(limit)
      .skip((page - 1) * limit);

    const hasNext = page * limit < total; // Check if there are more pages
    const hasPrev = page > 1; // Check if there is a previous page

    return {
      total, // Total number of matching documents
      hasNext,
      hasPrev,
      dataLength: result.length, // Length of the paginated data
      data: result, // Paginated data
    };
  } catch (error) {
    logger.error("Error fetching profiles:", error);

    throw new Error("Error fetching profiles");
  }
};
