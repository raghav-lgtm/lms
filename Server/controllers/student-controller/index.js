const Course = require("../../models/Course.js");

const getAllCoursesForStudent = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true });
    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Error in getting all courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getStudentCourseDetailsById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error in getting course details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllCoursesForStudent,
  getStudentCourseDetailsById,
};
