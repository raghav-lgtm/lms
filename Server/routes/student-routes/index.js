const express = require("express");
const {
  getAllCoursesForStudent,
  getStudentCourseDetailsById,
} = require("../../controllers/student-controller/index");

const router = express.Router();

router.get("/get", getAllCoursesForStudent);
router.get("/get/details/:courseId", getStudentCourseDetailsById);

module.exports = router;
