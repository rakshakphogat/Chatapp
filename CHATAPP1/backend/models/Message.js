import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender ID is required"]
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Receiver ID is required"]
        },
        text: {
            type: String,
            trim: true
        },
        image: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// Add compound index for efficient message queries
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

// Validation: Either text or image must be present
messageSchema.pre('save', function (next) {
    if (!this.text && !this.image) {
        return next(new Error('Message must contain either text or image'));
    }
    next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;