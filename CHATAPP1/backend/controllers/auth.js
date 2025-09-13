import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    console.log('Signup request received:', { fullName, email, passwordLength: password?.length });

    try {
        // Validation
        if (!fullName || !email || !password) {
            console.log('Validation failed: Missing fields');
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            console.log('Validation failed: Password too short');
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Validation failed: User already exists');
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        console.log('User created successfully:', newUser._id);

        // Generate JWT token
        generateToken(newUser._id, res);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            }
        });

    } catch (error) {
        console.error("Error in signup controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate JWT token
        generateToken(user._id, res);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
            }
        });

    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error in logout controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({
                success: false,
                message: "Profile picture is required"
            });
        }

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Error in update profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error("Error in checkAuth controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};