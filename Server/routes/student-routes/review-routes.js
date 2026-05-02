const express = require("express");
const { addReview, getCourseReviews } = require("../../controllers/student-controller/review-controller");

const router = express.Router();

router.post("/add", addReview);
router.get("/:courseId", getCourseReviews);

module.exports = router;
