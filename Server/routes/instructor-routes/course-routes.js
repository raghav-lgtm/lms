const express = require("express");
const {
  addCourse,
  getAllCourses,
  getCourseDetailsById,
  updateCourseById,
} = require("../../controllers/course-controller/index");

const router = express.Router();

router.post("/addCourse", addCourse);
router.get("/getAllCourses", getAllCourses);
router.get("/getCourse/:id", getCourseDetailsById);
router.put("/updateCourse/:id", updateCourseById);

module.exports = router;
