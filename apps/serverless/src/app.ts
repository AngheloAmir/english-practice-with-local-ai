import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import helloRouter from "./routes/hello";

const app = express();

app.use(cors());
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

const router = express.Router();
router.get("/", (req: Request, res: Response) => {
   res.sendFile(path.join(__dirname, "../public/index.html"));
});

router.use("/hello", helloRouter);

// Mount router at root and api paths to handle various gateway configurations
app.use("/.netlify/functions/api", router);
app.use("/api", router);
app.use("/", router);

export default app;
