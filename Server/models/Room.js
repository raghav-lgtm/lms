const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    courseId: {
        type: String,  // ← match your project's pattern
        required: true,
        unique: true,
    },
    courseTitle: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Room", roomSchema);