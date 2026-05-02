const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  courseId: String,
  userId: String,
  userName: String,
  rating: Number, // 1 to 5
  reviewMessage: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", ReviewSchema);
