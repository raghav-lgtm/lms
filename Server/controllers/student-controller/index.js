const Course = require("../../models/Course.js");

const getAllCoursesForStudent = async (req, res) => {
  try {
    const {
      category = "",
      level = "",
      primaryLanguage = "",
      sortBy = "price-lowtohigh",
    } = req.query;

    let filters = { isPublished: true };
    if (category) filters.category = { $in: category.split(",") };
    if (level) filters.level = { $in: level.split(",") };
    if (primaryLanguage) filters.primaryLanguage = { $in: primaryLanguage.split(",") };

    let sortParam = {};
    if (sortBy === "price-lowtohigh") sortParam.pricing = 1;
    else if (sortBy === "price-hightolow") sortParam.pricing = -1;
    else if (sortBy === "title-atoz") sortParam.title = 1;
    else if (sortBy === "title-ztoa") sortParam.title = -1;

    const courses = await Course.find(filters).sort(sortParam);
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
