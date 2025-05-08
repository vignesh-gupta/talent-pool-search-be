import { SearchDataType } from "./zod/searches";

export const generateSearchTitle = (params: SearchDataType) => {
  const { title, location, skills, company, availableBy } = params;

  if (title) {
    return title;
  }

  const searchTitleArr = [];

  if (skills && skills.length > 0) {
    searchTitleArr.push(
      `Skills: ${skills
        .map((skill) => `${skill.name}-${skill.experience ?? 0}`)
        .join(", ")}`
    );
  }

  if (location) {
    searchTitleArr.push(`Location: ${location}`);
  }

  if (company) {
    searchTitleArr.push(`Company: ${company}`);
  }

  if (availableBy) {
    searchTitleArr.push(`Available By: ${availableBy.toDateString()}`);
  }

  if (searchTitleArr.length === 0) {
    return "No search criteria provided";
  }

  return searchTitleArr.join(", ");
};
