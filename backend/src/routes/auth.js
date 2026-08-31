// backend/src/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Helper function to generate JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "codeforge_jwt_secret_key_2026_production_grade";
  return jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ error: "User already exists with this email." });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: "Invalid email or password." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// @route   PUT /api/auth/profile
// @desc    Update user profile username or email
router.put("/profile", protect, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (username) user.username = username.trim();
    if (email) user.email = email.trim();

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update profile." });
  }
});

module.exports = router;
