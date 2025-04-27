import { Profile } from "../schemas/profile";

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

  const query: any = {};

  if (skills) {
    const skillsArray = Array.isArray(skills)
      ? skills
      : skills.toString().split(",");
    const minExpArray = Array.isArray(skillsMinExp)
      ? skillsMinExp
      : skillsMinExp?.toString().split(",") || [];

    query.skills = {
      $all: skillsArray.map((skill, index) => ({
        $elemMatch: {
          name: { $regex: skill, $options: "i" }, // Case-insensitive fuzzy search
          experience: { $gte: minExpArray[index] || 0 }, // Use corresponding minExp or default to 0
        },
      })),
    };
  }

  // Process company filter - search across the experience array
  if (company) {
    query.experience = {
      $elemMatch: {
        company: { $regex: company, $options: "i" },
      },
    };
  }

  if (availableBy) {
    const availableByDate = new Date(availableBy.toString());

    // { "availability.from": { $lte: ISODate("2025-06-01") }, "availability.to": { $gte: ISODate("2025-06-01") } }
    query["availability.from"] = { $lte: availableByDate }; 
    query["availability.to"] = { $gte: availableByDate };   
  }

  return query;
};

export const getProfiles = async (query: any, page: number, limit : number) => {
  try {
    
    const profiles = await Profile.find(query).limit(limit).skip((page - 1) * limit).exec();
    return profiles;
  } catch (error) {
    throw new Error("Error fetching profiles");
  }
};
