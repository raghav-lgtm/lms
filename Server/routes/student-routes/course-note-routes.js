const express = require("express");
const { addNote, getNotes, deleteNote } = require("../../controllers/student-controller/course-note-controller");

const router = express.Router();

router.post("/add", addNote);
router.get("/:userId/:courseId/:lectureId", getNotes);
router.delete("/:noteId", deleteNote);

module.exports = router;
