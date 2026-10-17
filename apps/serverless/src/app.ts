import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import helloRouter from "./routes/hello";
import chatRouter from "./routes/service/chat";
import ttsRouter from "./routes/service/tts";
import sttRouter from "./routes/service/stt";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

const router = express.Router();
router.get("/", (req: Request, res: Response) => {
   res.sendFile(path.join(__dirname, "../public/index.html"));
});

router.use("/hello", helloRouter);

//services
router.use("/service/chat", chatRouter);
router.use("/service/tts", ttsRouter);
router.use("/service/stt", sttRouter);


// Mount router at root and api paths to handle various gateway configurations
app.use("/.netlify/functions/api", router);
app.use("/api", router);
app.use("/", router);


export default app;
