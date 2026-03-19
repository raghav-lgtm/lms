require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes/index");
const instructorRoutes = require("./routes/instructor-routes/media-routes");
const courseRoutes = require("./routes/instructor-routes/course-routes");
const studentCourseRoutes = require("./routes/student-routes/index");
const orderRoutes = require("./routes/student-routes/order-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const corsOptions = {
  // In dev, reflect the request origin (fixes common localhost/5173 vs 127.0.0.1 issues).
  origin: (origin, callback) => {
    // allow non-browser clients (curl/postman)
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
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

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

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

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
