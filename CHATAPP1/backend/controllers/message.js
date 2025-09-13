import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Get all users except the logged-in user
        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId }
        }).select("-password");

        res.status(200).json({
            success: true,
            users: filteredUsers
        });
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        // Get messages between the two users
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("Error in getMessages controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Validation
        if (!text && !image) {
            return res.status(400).json({
                success: false,
                message: "Message must contain either text or image"
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        let imageUrl;
        if (image) {
            // Upload image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // Emit to receiver via socket.io for real-time messaging
        const receiverSocketIds = getReceiverSocketId(receiverId);
        if (receiverSocketIds && receiverSocketIds.length > 0) {
            // Send to all of the receiver's active sessions
            receiverSocketIds.forEach(socketId => {
                io.to(socketId).emit("newMessage", newMessage);
            });
            console.log("📤 Message sent to", receiverSocketIds.length, "receiver sessions");
        } else {
            console.log("📴 Receiver is offline");
        }

        res.status(201).json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error("Error in sendMessage controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};