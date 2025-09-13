import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production"
            ? [
                process.env.FRONTEND_URL,
                "https://chatapp-rc3y.vercel.app",
                "https://chatapp-frontend-lake.vercel.app",
                "https://chatapp-frontend.vercel.app",
                /\.vercel\.app$/,
                /\.onrender\.com$/
            ]
            : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Store online users - using Set to prevent duplicates
const onlineUsers = new Set();
// Map socket IDs to user IDs for cleanup
const socketToUserMap = new Map(); // {socketId: userId}

export const getReceiverSocketId = (receiverId) => {
    // Find all sockets for this user
    const userSockets = [];
    for (const [socketId, userId] of socketToUserMap.entries()) {
        if (userId === receiverId) {
            userSockets.push(socketId);
        }
    }
    return userSockets; // Return array of socket IDs for the user
};

// Helper function to emit online users
const emitOnlineUsers = () => {
    const onlineUserIds = Array.from(onlineUsers);
    console.log("📡 Broadcasting online users:", onlineUserIds);
    io.emit("getOnlineUsers", onlineUserIds);
};

io.on("connection", (socket) => {
    console.log("🔗 Socket connected:", socket.id);

    const userId = socket.handshake.query.userId;
    console.log("👤 User ID from query:", userId);

    if (userId && userId !== "undefined" && userId !== "null") {
        // Add to socket mapping
        socketToUserMap.set(socket.id, userId);

        // Add user to online set (Set automatically handles duplicates)
        const wasOffline = !onlineUsers.has(userId);
        onlineUsers.add(userId);

        console.log("✅ User connected:", userId);
        console.log("🔗 Socket mapped:", socket.id, "->", userId);

        if (wasOffline) {
            console.log("� User came online:", userId);
            console.log("📱 Total online users:", onlineUsers.size);
            emitOnlineUsers();
        } else {
            console.log("🔄 User has multiple connections");
        }
    } else {
        console.log("⚠️ Invalid user ID, socket not mapped");
    }

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);

        const userId = socketToUserMap.get(socket.id);
        if (userId) {
            // Remove socket mapping
            socketToUserMap.delete(socket.id);
            console.log("🗑️ Removed socket mapping:", socket.id);

            // Check if user has any other active connections
            const hasOtherConnections = Array.from(socketToUserMap.values()).includes(userId);

            if (!hasOtherConnections) {
                // User has no more connections, mark as offline
                onlineUsers.delete(userId);
                console.log("� User went offline:", userId);
                console.log("📱 Total online users:", onlineUsers.size);
                emitOnlineUsers();
            } else {
                console.log("� User still has other active connections");
            }
        }
    });

    // Handle connection errors
    socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
    });
});

export { io, app, server };