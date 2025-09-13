import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the same directory as this file
dotenv.config({ path: path.join(__dirname, '.env') });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import routes and configurations
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import { app, server } from "./lib/socket.js";
import { getCloudinary } from "./lib/cloudinary.js";

// Environment variables validation
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "PORT"];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingEnvVars);
    process.exit(1);
}

// Initialize Cloudinary after environment variables are loaded
try {
    getCloudinary();
} catch (error) {
    console.error("❌ Failed to initialize Cloudinary:", error.message);
    process.exit(1);
}

// Port configuration
const PORT = process.env.PORT || 5001;

// Log environment status
console.log("🔧 Environment Configuration:");
console.log("PORT:", PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Loaded" : "❌ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.vercel.app", "https://chatapp-frontend.vercel.app"]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(express.json({ limit: "10mb" })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // Catch all handler for SPA
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

// 404 handler for API routes
app.use("/api/*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("❌ Global error handler:", err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message
    });
});

// Start server
const startServer = async () => {
    try {
        // Connect to database first
        await connectDB();

        // Start listening
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`📱 Health check: http://localhost:${PORT}/health`);

            if (process.env.NODE_ENV !== "production") {
                console.log(`🔗 Local API: http://localhost:${PORT}/api`);
            }
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on("SIGTERM", () => {
    console.log("🔄 SIGTERM received, shutting down gracefully...");
    server.close(() => {
        console.log("✅ Process terminated");
    });
});

process.on("SIGINT", () => {
    console.log("🔄 SIGINT received, shutting down gracefully...");
    server.close(() => {
        console.log("✅ Process terminated");
    });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Promise Rejection:", err);
    server.close(() => {
        process.exit(1);
    });
});

// Start the server
startServer();