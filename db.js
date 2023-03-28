import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";

const { Client } = pkg;

export const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

await client.connect();
console.log("Terhubung ke basis data.");
