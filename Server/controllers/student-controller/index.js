const Course = require("../../models/Course.js");

const getAllCoursesForStudent = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true });

    res.status(200).json({
      success: true,
      data: courses, // just return empty array, not a 404
    });
  } catch (error) {
    console.error("Error in getting all courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllCoursesForStudent,
};
