const Course = require("../../models/Course");
const addCourse = async (req, res) => {
  try {
    const courseDetails = req.body;

    const newCourse = new Course(courseDetails);
    const savedCourse = await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course successfully added",
      data: savedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add course",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const allCourses = await Course.find({ instructor_id: instructorId });

    res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

const getCourseDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

const updateCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const newCourseDetails = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(id, newCourseDetails, {
      new: true,
    });

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

module.exports = {
  addCourse,
  getAllCourses,
  getCourseDetailsById,
  updateCourseById,
};
