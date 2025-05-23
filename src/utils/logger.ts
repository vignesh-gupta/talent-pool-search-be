import winston from "winston";
import { config } from "../configs/config";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console(),

  // Uncomment the following lines to enable file logging
  // new winston.transports.File({
  //   filename: "logs/error.log",
  //   level: "error",
  // }),
  // new winston.transports.File({ filename: "logs/all.log" }),
];

const logger = winston.createLogger({
  level: config.env === "development" ? "debug" : "warn",
  levels,
  format,
  transports,
});

export default logger;
