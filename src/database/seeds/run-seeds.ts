import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { AppDataSource } from "../../config/database";
import { runSeeds } from "./index";

AppDataSource.initialize()
  .then((ds) => runSeeds(ds))
  .then(() => {
    console.log("✅ Seeds complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
