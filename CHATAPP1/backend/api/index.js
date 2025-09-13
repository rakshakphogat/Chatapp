import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

const app = express();

// Basic CORS setup
app.use(cors({
    origin: [
        "https://chatapp-rc3y.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ChatApp Backend API is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString()
    });
});

// Database connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log("Using existing database connection");
        return;
    }

    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            isConnected = true;
            console.log("✅ MongoDB connected");
        } else {
            console.log("❌ MONGODB_URI not found");
        }
    } catch (error) {
        console.error("❌ Database connection error:", error.message);
    }
};

// Initialize DB connection
connectDB();

// Import and use routes only after basic setup
let authRoutes, messageRoutes;

try {
    const authModule = await import("../routes/auth.js");
    const messageModule = await import("../routes/message.js");
    
    authRoutes = authModule.default;
    messageRoutes = messageModule.default;
    
    app.use("/api/auth", authRoutes);
    app.use("/api/messages", messageRoutes);
    
    console.log("✅ Routes loaded successfully");
} catch (error) {
    console.error("❌ Error loading routes:", error.message);
    
    // Fallback routes if imports fail
    app.get("/api/auth/check", (req, res) => {
        res.json({ success: false, message: "Auth routes not loaded" });
    });
    
    app.get("/api/messages/users", (req, res) => {
        res.json({ success: false, message: "Message routes not loaded" });
    });
}

// 404 handler
app.use("/api/*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// Export for Vercel
export default app;