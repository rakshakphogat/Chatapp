import express from "express";
import {
    getMessages,
    getUsersForSidebar,
    sendMessage
} from "../controllers/message.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// All message routes are protected
router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;