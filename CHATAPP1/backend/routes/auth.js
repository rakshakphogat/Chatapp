import express from "express";
import {
    signup,
    login,
    logout,
    updateProfile,
    checkAuth
} from "../controllers/auth.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;