const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth-middleware");
const {
  registerUser,
  loginUser,
  googleAuth,
} = require("../../controllers/auth-controller/index");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/auth-user", authenticate, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated User",
    data: {
      user,
    },
  });
});

module.exports = router;
