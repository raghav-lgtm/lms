const Wishlist = require("../../models/Wishlist");
const Course = require("../../models/Course");

const toggleWishlist = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        courses: [{ courseId }],
      });
      await wishlist.save();
      return res.status(200).json({ success: true, message: "Added to wishlist", data: wishlist });
    }

    const courseIndex = wishlist.courses.findIndex(item => item.courseId === courseId);

    if (courseIndex > -1) {
      // Remove if exists
      wishlist.courses.splice(courseIndex, 1);
      await wishlist.save();
      return res.status(200).json({ success: true, message: "Removed from wishlist", data: wishlist });
    } else {
      // Add if doesn't exist
      wishlist.courses.push({ courseId });
      await wishlist.save();
      return res.status(200).json({ success: true, message: "Added to wishlist", data: wishlist });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to toggle wishlist" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist || wishlist.courses.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const courseIds = wishlist.courses.map(c => c.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } });

    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load wishlist" });
  }
};

module.exports = {
  toggleWishlist,
  getWishlist,
};
