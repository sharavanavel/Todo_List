// ============================================================
// server/index.js — the backend API for the Task Manager.
// It connects to MongoDB (Atlas or local) and exposes:
//   GET    /api/tasks        list all tasks
//   POST   /api/tasks        create a task
//   PUT    /api/tasks/:id    update a task
//   DELETE /api/tasks/:id    delete a task
//   GET    /api/health       simple "is it alive?" check
// In production it ALSO serves the built React app (../dist),
// so one deployment hosts both the frontend and the backend.
// ============================================================
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

// CORS is only needed when the frontend lives on another domain.
if (process.env.CLIENT_ORIGIN) {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim()) }));
}

// ---------- Schema: same fields the React app already uses ----------
const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: null },
  completed:   { type: Boolean, default: false },
  dueDate:     { type: String, default: null }, // "2026-09-19"
  dueTime:     { type: String, default: null }, // "14:30"
  priority:    { type: String, enum: ["Low", "Normal", "High"], default: "Normal" },
  category:    { type: String, default: "General" },
  emailSent:   { type: Boolean, default: false },
});

// Return `id` instead of `_id`, so the React components need no changes.
taskSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

const Task = mongoose.model("Task", taskSchema);

// Only these fields may be written from the outside.
const ALLOWED_FIELDS = [
  "title", "description", "completed", "dueDate",
  "dueTime", "priority", "category", "emailSent",
];
function pickAllowed(body) {
  const clean = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
}

// Lets us use async/await in routes without repeating try/catch.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- Routes ----------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.get("/api/tasks", wrap(async (req, res) => {
  res.json(await Task.find().sort({ _id: 1 }));
}));

app.post("/api/tasks", wrap(async (req, res) => {
  const task = await Task.create(pickAllowed(req.body));
  res.status(201).json(task);
}));

app.put("/api/tasks/:id", wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid task id" });
  }
  const task = await Task.findByIdAndUpdate(req.params.id, pickAllowed(req.body), {
    new: true,
    runValidators: true,
  });
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
}));

app.delete("/api/tasks/:id", wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid task id" });
  }
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).end();
}));

// ---------- Serve the built React app (production) ----------
const distPath = path.join(__dirname, "..", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err.message);
  const status = err.name === "ValidationError" ? 400 : 500;
  res.status(status).json({ error: err.message });
});

// ---------- Connect to MongoDB, then start listening ----------
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing. Copy server/.env.example to server/.env and fill it in.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
