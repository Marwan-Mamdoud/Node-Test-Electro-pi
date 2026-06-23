import app from "./app";
import { AppDataSource } from "./config/database";
import { runSeeds } from "./database/seeds";
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await runSeeds(AppDataSource);
      console.log("✅ Database connected");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
