const express = require("express");
const {
  getAllCoursesForStudent,
} = require("../../controllers/student-controller/index");

const router = express.Router();

router.get("/get-all-courses", getAllCoursesForStudent);

module.exports = router;
