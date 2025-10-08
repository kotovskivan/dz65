import serverless from "serverless-http";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import itemsRouter from "../routes/items.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    name: "DZ65 API",
    ok: true,
    routes: {
      health: "/api/health",
      list: "/api/items",
      byId: "/api/items/:id"
    }
  });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/items", itemsRouter);

app.use((req, res) => res.status(404).json({ message: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ message: "Internal Server Error", error: String(err?.message || err) });
});

export default serverless(app);

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("Local dev at http://localhost:" + port));
}
