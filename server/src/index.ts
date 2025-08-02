import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import apifyRoutes from "./routes/apify.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3001;

// ✨ FIX: Explicitly configure CORS to allow all origins
app.use(
  cors({
    origin: "*", // In a real production app, you would restrict this to your frontend's domain
  })
);

app.use(express.json());
app.use("/api", apifyRoutes);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
  });
}

// Export the app for Vercel
export default app;
