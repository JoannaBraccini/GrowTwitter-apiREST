import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import { AuthRoutes, UserRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    message: "GrowTwitter API 💻🌍",
  });
});

app.use(AuthRoutes.execute());
app.use(UserRoutes.execute());

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
