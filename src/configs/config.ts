export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI,
  logs: process.env.NODE_ENV === "production" ? "combined" : "dev",
};
