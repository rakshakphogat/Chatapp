import express from "express";
import cors from "cors";

const app = express();

// Enable CORS
app.use(cors({
    origin: [
        "https://chatapp-rc3y.vercel.app",
        "https://chatapp-frontend-lake.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    credentials: true
}));

app.use(express.json());

// Test route
app.get("/", (req, res) => {
    try {
        res.json({
            success: true,
            message: "ChatApp Backend API is running",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development"
        });
    } catch (error) {
        console.error("Error in root route:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/health", (req, res) => {
    try {
        res.json({
            success: true,
            message: "Server is healthy",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error in health route:", error);
        res.status(500).json({ error: error.message });
    }
});

// Simple test API route
app.get("/api/test", (req, res) => {
    try {
        res.json({
            success: true,
            message: "API test successful",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error in test route:", error);
        res.status(500).json({ error: error.message });
    }
});

// Export for Vercel
export default app;