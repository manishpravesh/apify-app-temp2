import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import apifyRoutes from "./routes/apify.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api", apifyRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
