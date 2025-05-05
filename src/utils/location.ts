import { locationSchema, LocationSchema } from "./zod/profiles";

export const getLocation = async (
  location: string
): Promise<LocationSchema> => {
  const response = await fetch(
    `https://geocode.maps.co/search?q=${location}&api_key=${process.env.GEOCODE_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location data");
  }

  const locations = await response.json();

  if (!locations || locations.length === 0) {
    throw new Error("Location not found");
  }

  const { success, data } = locationSchema.safeParse(locations[0]);

  if (!success) {
    throw new Error("Invalid location data");
  }

  return data;
};
