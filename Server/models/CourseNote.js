const mongoose = require("mongoose");

const courseNoteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    courseId: {
        type: String,
        required: true,
    },
    lectureId: {
        type: String,
        required: true,
    },
    noteText: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Number, // expressed in seconds (e.g. 125.5 for 2m5s)
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

courseNoteSchema.index({ userId: 1, courseId: 1, lectureId: 1 });

module.exports = mongoose.model("CourseNote", courseNoteSchema);
