const Course = require("../../models/Course.js");
const redisClient = require("../../config/redis");

const getAllCoursesForStudent = async (req, res) => {
  try {
    const {
      category = "",
      level = "",
      primaryLanguage = "",
      sortBy = "price-lowtohigh",
    } = req.query;

    const cacheKey = `courses:student:cat=${category}:lvl=${level}:lang=${primaryLanguage}:sort=${sortBy}`;
    
    // Check cache
    try {
      const cachedCourses = await redisClient.get(cacheKey);
      if (cachedCourses) {
        console.log("Cache Hit: getAllCoursesForStudent");
        return res.status(200).json({
          success: true,
          data: JSON.parse(cachedCourses),
        });
      }
    } catch (cacheError) {
      console.error("Redis get error:", cacheError);
      // Fall through to DB if cache fails
    }

    console.log("Cache Miss: getAllCoursesForStudent");

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

    // Save to cache for 1 hour (3600 seconds)
    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(courses));
    } catch (cacheError) {
      console.error("Redis set error:", cacheError);
    }

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

    const cacheKey = `course:details:${courseId}`;

    // Check cache
    try {
      const cachedCourse = await redisClient.get(cacheKey);
      if (cachedCourse) {
        console.log("Cache Hit: getStudentCourseDetailsById");
        return res.status(200).json({
          success: true,
          data: JSON.parse(cachedCourse),
        });
      }
    } catch (cacheError) {
      console.error("Redis get error:", cacheError);
    }

    console.log("Cache Miss: getStudentCourseDetailsById");

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Save to cache for 1 hour
    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(course));
    } catch (cacheError) {
      console.error("Redis set error:", cacheError);
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
