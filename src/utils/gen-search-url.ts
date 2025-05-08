import { SearchDataType } from "./zod/searches";

export const generateSearchURL = (params: SearchDataType) => {
  const { title, location, skills, company, availableBy } = params;
  let searchUrl = `${process.env.BASE_URL}/api/v1/profiles/search?`;

  if (skills && skills.length > 0) {
    const skillsArray = skills.map((skill) => skill.name).join(",");
    const skillsMinExp = skills.map((skill) => skill.experience).join(",");
    searchUrl += `skills=${skillsArray}&skillsMinExp=${skillsMinExp}`;
  }

  if (company) searchUrl += `&company=${company}`;

  if (location) searchUrl += `&location=${location}`;

  if (availableBy) searchUrl += `&availableBy=${availableBy}`;

  return searchUrl;
};
