const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
  try {
    const { userName, userEmail, password, role } = req.body;
    const existingUser = await User.findOne({
      $or: [{ userName }, { userEmail }],
    });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "the user already exists",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      userName,
      userEmail,
      password: hashPassword,
      role,
    });
    await newUser.save();
    return res.status(200).json({
      success: true,
      message: "the new user was successfully registered",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { userEmail, password } = req.body;
    const userDetails = await User.findOne({ userEmail });
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      userDetails.password,
    );
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const accessToken = jwt.sign(
      {
        _id: userDetails._id,
        userName: userDetails.userName,
        userEmail: userDetails.userEmail,
        role: userDetails.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "120m" },
    );
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        accessToken,
        user: {
          id: userDetails._id,
          userName: userDetails.userName,
          userEmail: userDetails.userEmail,
          role: userDetails.role,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let userDetails = await User.findOne({ userEmail: email });
    if (!userDetails) {
      // Create user if they do not exist
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashPassword = await bcrypt.hash(randomPassword, 10);
      userDetails = new User({
        userName: name,
        userEmail: email,
        password: hashPassword,
        role: "user",
      });
      await userDetails.save();
    }

    const accessToken = jwt.sign(
      {
        _id: userDetails._id,
        userName: userDetails.userName,
        userEmail: userDetails.userEmail,
        role: userDetails.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "120m" },
    );

    res.status(200).json({
      success: true,
      message: "Logged in with Google successfully",
      data: {
        accessToken,
        user: {
          id: userDetails._id,
          userName: userDetails.userName,
          userEmail: userDetails.userEmail,
          role: userDetails.role,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Google verification failed: " + err.message });
  }
};

module.exports = { registerUser, loginUser, googleAuth };
