import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

// import { connectDB } from "./lib/db.js";
import { connectDB } from "./lib/lib.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT;
console.log("Environment variables loaded:");
console.log("PORT:", PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✓ Loaded" : "✗ Missing");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? ["https://your-frontend-domain.vercel.app", "https://chatapp-frontend.vercel.app"]
      : "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
