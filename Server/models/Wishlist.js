const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  courses: [
    {
      courseId: String,
    }
  ],
});

module.exports = mongoose.model("Wishlist", WishlistSchema);
