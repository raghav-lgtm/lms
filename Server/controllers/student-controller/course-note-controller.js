const CourseNote = require("../../models/CourseNote");

const addNote = async (req, res) => {
    try {
        const { userId, courseId, lectureId, noteText, timestamp } = req.body;

        if (!userId || !courseId || !lectureId || !noteText || timestamp === undefined) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const note = await CourseNote.create({
            userId,
            courseId,
            lectureId,
            noteText,
            timestamp,
        });

        res.status(201).json({ success: true, data: note, message: "Note added successfully" });
    } catch (err) {
        console.error("addNote error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getNotes = async (req, res) => {
    try {
        const { userId, courseId, lectureId } = req.params;

        const notes = await CourseNote.find({ userId, courseId, lectureId }).sort({ timestamp: 1 });

        res.status(200).json({ success: true, data: notes });
    } catch (err) {
        console.error("getNotes error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { userId } = req.body; // Expect userId to verify ownership

        const note = await CourseNote.findById(noteId);
        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }

        if (note.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await CourseNote.findByIdAndDelete(noteId);

        res.status(200).json({ success: true, message: "Note deleted successfully" });
    } catch (err) {
        console.error("deleteNote error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    addNote,
    getNotes,
    deleteNote,
};
