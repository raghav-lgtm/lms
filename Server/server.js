require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth-routes/index");
const instructorRoutes = require("./routes/instructor-routes/media-routes");
const courseRoutes = require("./routes/instructor-routes/course-routes");
const studentCourseRoutes = require("./routes/student-routes/index");
const orderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const studentCourseNoteRoutes = require("./routes/student-routes/course-note-routes");
const roomRoutes = require("./routes/room-routes/index");
const wishlistRoutes = require("./routes/student-routes/wishlist-routes");
const reviewRoutes = require("./routes/student-routes/review-routes");
const Message = require("./models/Message");
const Room = require("./models/Room");
const Course = require("./models/Course");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "https://lms-ten-orpin.vercel.app",
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// ── Socket.io ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // ── join a course chat room ──────────────────────────────────────────────
  // client emits this with { courseId, userId } after verifying enrollment
  socket.on("join-room", async ({ courseId, userId }) => {
    try {
      // verify the user is actually enrolled in this course
      const course = await Course.findById(courseId);
      if (!course) return socket.emit("error", { message: "Course not found" });

      const isEnrolled = course.students.some((s) => s.studentId === userId);
      const isInstructor = course.instructor_id === userId;

      if (!isEnrolled && !isInstructor) {
        return socket.emit("error", {
          message: "You are not enrolled in this course",
        });
      }

      socket.join(courseId); // use courseId as the socket room name
      console.log(`User ${userId} joined room for course ${courseId}`);

      socket.emit("joined-room", { courseId });
    } catch (err) {
      console.error("join-room error:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // ── send a message ───────────────────────────────────────────────────────
  // client emits: { roomId, courseId, senderId, senderName, senderRole, content, attachments, messageType }
  socket.on("send-message", async (data) => {
    try {
      const {
        roomId,
        courseId,
        senderId,
        senderName,
        senderRole = "student",
        content = "",
        attachments = [],
        messageType = "text",
        channel = "general",
      } = data;

      if (channel === "announcements" && senderRole !== "instructor") {
        return socket.emit("error", { message: "Only instructors can post announcements" });
      }

      // save message to DB
      const message = await Message.create({
        roomId,
        senderId,
        senderName,
        senderRole,
        content,
        attachments,
        messageType,
        channel,
      });

      // broadcast to everyone in the course room (including sender)
      io.to(courseId).emit("receive-message", message);
    } catch (err) {
      console.error("send-message error:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // ── delete a message ─────────────────────────────────────────────────────
  // client emits: { messageId, courseId, userId }
  socket.on("delete-message", async ({ messageId, courseId, userId }) => {
    try {
      const message = await Message.findById(messageId);

      if (!message) return socket.emit("error", { message: "Message not found" });

      if (message.senderId !== userId) {
        return socket.emit("error", {
          message: "You can only delete your own messages",
        });
      }

      message.isDeleted = true;
      await message.save();

      // notify everyone in the room so they can update the UI
      io.to(courseId).emit("message-deleted", { messageId });
    } catch (err) {
      console.error("delete-message error:", err);
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  // ── leave a room ─────────────────────────────────────────────────────────
  socket.on("leave-room", ({ courseId }) => {
    socket.leave(courseId);
    console.log(`Socket ${socket.id} left room ${courseId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ── MongoDB ────────────────────────────────────────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// ── REST routes ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to EduHub Server" });
});

app.use("/auth", authRoutes);
app.use("/media", instructorRoutes);
app.use("/instructor/course", courseRoutes);
app.use("/student/course", studentCourseRoutes);
app.use("/student/order", orderRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);
app.use("/student/course-note", studentCourseNoteRoutes);
app.use("/student/wishlist", wishlistRoutes);
app.use("/student/review", reviewRoutes);
app.use("/rooms", roomRoutes); // ← new

// ── global error handler ───────────────────────────────────────────────────
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});