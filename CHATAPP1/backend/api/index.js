import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables. When running locally from /backend we want the root .env file (one level up)
// In Vercel, process.cwd() will be the build output for this function, so we attempt both locations gracefully.
const rootEnvPath = path.join(__dirname, '..', '.env');
const localEnvPath = path.join(__dirname, '.env');
dotenv.config({ path: rootEnvPath });
// Fallback if not loaded
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: localEnvPath });
}

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import routes and configurations
import { connectDB } from "../lib/db.js";
import authRoutes from "../routes/auth.js";
import messageRoutes from "../routes/message.js";
import { getCloudinary } from "../lib/cloudinary.js";

// Create Express app for Vercel
const app = express();

// Environment variables validation
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingEnvVars);
    // Don't exit in Vercel, just log the error
    console.error("This may cause authentication and database issues");
}

// Initialize Cloudinary after environment variables are loaded
try {
    getCloudinary();
} catch (error) {
    console.error("❌ Failed to initialize Cloudinary:", error.message);
    console.error("Image uploads may not work properly");
}

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = process.env.NODE_ENV === "production"
            ? [
                process.env.FRONTEND_URL,
                "https://chatapp-rc3y.vercel.app",
                "https://chatapp-frontend.vercel.app",
                // Allow any Vercel app subdomain
                ...origin.match(/^https:\/\/.*\.vercel\.app$/) ? [origin] : []
            ]
            : [
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174"
            ];

        // Check if the origin is in allowed origins or matches vercel pattern
        if (allowedOrigins.includes(origin) ||
            (process.env.NODE_ENV === "production" && /^https:\/\/.*\.vercel\.app$/.test(origin))) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204
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
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "ChatApp Backend API is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0"
    });
});

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

// 404 handler for API routes
app.use("/api/*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        path: req.path
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

// Connect to database (ensure single connection in serverless by caching the promise on globalThis)
if (!globalThis.__dbPromise) {
    globalThis.__dbPromise = connectDB().catch(err => {
        console.error("❌ Database connection failed:", err);
    });
} else {
    // Reuse existing promise
    globalThis.__dbPromise.then(() => console.log("🔁 Reusing existing DB connection"));
}

// Export for Vercel
export default app;

// Allow running this file directly with: node api/index.js (useful for local test of serverless build)
if (process.argv[1] && process.argv[1].endsWith('api\\index.js')) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`🚀 API (serverless style) running locally on http://localhost:${PORT}`);
    });
}