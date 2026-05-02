const express = require("express");
const router = express.Router();
const {
    createRoom,
    getRoomByCourseId,
    getMessages,
    deleteMessage,
} = require("../../controllers/room-controller/index");

// create a room — called automatically on course creation
router.post("/create", createRoom);

// get room details by courseId — called when user opens the chat
router.get("/course/:courseId", getRoomByCourseId);

// get paginated messages for a room
// optional query params: ?before=<timestamp>&limit=<number>
router.get("/:roomId/messages", getMessages);

// soft delete a message
router.delete("/message/:messageId", deleteMessage);

module.exports = router;