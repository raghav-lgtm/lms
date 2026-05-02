const express = require("express");
const { toggleWishlist, getWishlist } = require("../../controllers/student-controller/wishlist-controller");

const router = express.Router();

router.post("/toggle", toggleWishlist);
router.get("/:userId", getWishlist);

module.exports = router;
