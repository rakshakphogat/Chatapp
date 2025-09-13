import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production"
            ? ["https://your-frontend-domain.vercel.app", "https://chatapp-frontend.vercel.app"]
            : ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Store online users
const userSocketMap = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
    console.log("🔗 A user connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("❌ A user disconnected:", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };