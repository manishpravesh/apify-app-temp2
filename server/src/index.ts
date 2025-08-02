import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import apifyRoutes from "./routes/apify.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api", apifyRoutes);
app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(` Server is running at http://localhost:${port}`);
  });
}

export default app;
