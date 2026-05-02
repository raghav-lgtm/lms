const express = require("express");
const {
  addCourse,
  getAllCourses,
  getCourseDetailsById,
  updateCourseById,
  deleteCourseById,
} = require("../../controllers/instructor-controller/index");

const { generateQuiz } = require("../../controllers/instructor-controller/quiz-controller");

const router = express.Router();

router.post("/addCourse", addCourse);
router.post("/generate-quiz", generateQuiz);
router.get("/getAllCourses/:instructorId", getAllCourses);
router.get("/getCourse/:id", getCourseDetailsById);
router.put("/updateCourse/:id", updateCourseById);
router.delete("/deleteCourse/:id", deleteCourseById);

module.exports = router;
