const jwt = require("jsonwebtoken");

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token, process.env.JWT_SECRET);

    req.user = payload; // { userId, role, iat, exp }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { authenticate };
