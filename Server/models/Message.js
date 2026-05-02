const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    roomId: {
        type: String,  // ← not ObjectId
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    senderName: {
        type: String,
        required: true,
    },
    senderRole: {
        type: String,
        enum: ["student", "instructor"],
        default: "student",
    },
    content: {
        type: String,
        default: "",
    },
    attachments: [
        {
            fileName: String,
            fileUrl: String,    // Cloudinary URL (same as your existing media uploads)
            fileType: String,   // "image", "pdf", "video", etc.
            public_id: String,  // for deletion from Cloudinary
        },
    ],
    messageType: {
        type: String,
        enum: ["text", "file", "mixed"],
        default: "text",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    channel: {
        type: String,
        enum: ["general", "resources", "announcements"],
        default: "general",
    },
});

// index for fast room message fetching — critical for performance
messageSchema.index({ roomId: 1, channel: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);