import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary lazily
let cloudinaryInstance = null;

const getCloudinary = () => {
    if (!cloudinaryInstance) {
        // Check if environment variables are available
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error("❌ Cloudinary configuration missing:");
            console.error("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅" : "❌");
            console.error("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅" : "❌");
            console.error("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅" : "❌");
            throw new Error("Cloudinary configuration is incomplete");
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        console.log("✅ Cloudinary configured successfully");
        cloudinaryInstance = cloudinary;
    }

    return cloudinaryInstance;
};

// Export the configured cloudinary instance
export default cloudinary;

// Also export the getter function for manual initialization
export { getCloudinary };