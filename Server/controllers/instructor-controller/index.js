const Course = require("../../models/Course.js");
const { deleteMediaFromCloudinary } = require("../../helper/cloudinary.js");

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

const deleteCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.curriculam?.length > 0) {
      await Promise.all(
        course.curriculam
          .filter((item) => item.public_id)
          .map((item) => deleteMediaFromCloudinary(item.public_id, "video")),
      );
    }

    if (course.image) {
      const imagePublicId = course.image.split("/").pop().split(".")[0];
      await deleteMediaFromCloudinary(imagePublicId, "image");
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course and all associated media deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

module.exports = {
  addCourse,
  getAllCourses,
  getCourseDetailsById,
  updateCourseById,
  deleteCourseById,
};
