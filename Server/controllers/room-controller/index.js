const Room = require("../../models/Room");
const Message = require("../../models/Message");
const Course = require("../../models/Course");

// ── Create a room for a course ─────────────────────────────────────────────
// Called automatically when a new course is published
const createRoom = async (req, res) => {
    try {
        const { courseId, courseTitle } = req.body;

        if (!courseId || !courseTitle) {
            return res.status(400).json({
                success: false,
                message: "courseId and courseTitle are required",
            });
        }

        // guard: don't create duplicate rooms
        const existingRoom = await Room.findOne({ courseId });
        if (existingRoom) {
            return res.status(200).json({ success: true, room: existingRoom });
        }

        const room = await Room.create({ courseId, courseTitle });

        res.status(201).json({ success: true, room });
    } catch (err) {
        console.error("createRoom error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ── Get room by courseId ───────────────────────────────────────────────────
// Called when a student/instructor opens the chat for a course
const getRoomByCourseId = async (req, res) => {
    try {
        const { courseId } = req.params;

        let room = await Room.findOne({ courseId });

        if (!room) {
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ success: false, message: "Course not found" });
            }
            // Auto create room for older courses
            room = await Room.create({ courseId, courseTitle: course.title });
        }

        res.status(200).json({ success: true, room });
    } catch (err) {
        console.error("getRoomByCourseId error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ── Get paginated messages for a room ─────────────────────────────────────
// Uses cursor-based pagination: pass `before` (a createdAt timestamp) to load older messages
const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { before, limit = 50, channel = "general" } = req.query;

        const query = { roomId, isDeleted: false, channel };

        // if `before` is passed, fetch messages older than that timestamp (for pagination)
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 }) // newest first
            .limit(Number(limit));

        // reverse so the client receives them oldest → newest
        res.status(200).json({ success: true, messages: messages.reverse() });
    } catch (err) {
        console.error("getMessages error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ── Soft delete a message ──────────────────────────────────────────────────
// Only the sender can delete their own message
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.body;

        const message = await Message.findById(messageId);

        if (!message) {
            return res
                .status(404)
                .json({ success: false, message: "Message not found" });
        }

        if (message.senderId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own messages",
            });
        }

        message.isDeleted = true;
        await message.save();

        res
            .status(200)
            .json({ success: true, message: "Message deleted successfully" });
    } catch (err) {
        console.error("deleteMessage error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    createRoom,
    getRoomByCourseId,
    getMessages,
    deleteMessage,
};