// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ error: "Not authorized, no token provided." });
    }

    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("FATAL CONFIG ERROR: JWT_SECRET environment variable is missing.");
      return res.status(500).json({ error: "Internal server authentication configuration error." });
    }
    const decoded = jwt.verify(token, secret);

    // Fetch user (excluding password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    // Proceed to next middleware or route handler
    return next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res
      .status(401)
      .json({ error: "Not authorized, token validation failed." });
  }
};

module.exports = { protect };
