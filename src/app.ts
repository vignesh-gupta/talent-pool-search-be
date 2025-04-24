import express from "express";
const app = express();
const port = 3000;

import "./db";
import { config, configDotenv } from "dotenv";

config({ path: __dirname+'/.env' });

app.get("/", (req, res) => {
  res.send("Hello NEWER World!");
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
