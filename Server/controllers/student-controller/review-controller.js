const Review = require("../../models/Review");
const CourseProgress = require("../../models/CourseProgress");

const addReview = async (req, res) => {
  try {
    const { courseId, userId, userName, rating, reviewMessage } = req.body;

    // Validate if the student actually bought the course via CourseProgress
    const courseProgress = await CourseProgress.findOne({ userId, courseId });

    if (!courseProgress) {
      return res.status(403).json({ success: false, message: "You must purchase the course to leave a review." });
    }

    // Upsert review
    let review = await Review.findOne({ courseId, userId });
    if (review) {
      review.rating = rating;
      review.reviewMessage = reviewMessage;
      review.createdAt = Date.now();
      await review.save();
    } else {
      review = new Review({
        courseId,
        userId,
        userName,
        rating,
        reviewMessage,
      });
      await review.save();
    }

    res.status(201).json({ success: true, message: "Review posted successfully", data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to post review" });
  }
};

const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await Review.find({ courseId }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating,
        totalReviews
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load reviews" });
  }
};

module.exports = {
  addReview,
  getCourseReviews,
};
