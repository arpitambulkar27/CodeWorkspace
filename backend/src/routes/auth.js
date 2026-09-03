// backend/src/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// RFC 5322 Compliant Email Regex Validator
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Helper function to generate JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "codeforge_jwt_secret_key_2026_production_grade";
  return jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user with strict email validation
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Please fill in all required fields." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        error: "Please enter a valid email address with a recognized domain extension (e.g. name@example.com)."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ error: "An account already exists with this email address." });
    }

    const user = await User.create({
      username: username.trim(),
      email: cleanEmail,
      password,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Registration failed." });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token with strict email validation
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        error: "Please enter a valid email address with a recognized domain extension (e.g. name@example.com)."
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: "Invalid email address or password." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || "Authentication failed." });
  }
});

// @route   POST /api/auth/social
// @desc    Google & GitHub OAuth Sign-Up / Login Handler
router.post("/social", async (req, res) => {
  try {
    const { provider, email, username, avatar } = req.body;

    if (!email || !provider) {
      return res.status(400).json({ error: "Social authentication details missing." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: "Invalid social account email format." });
    }

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      const generatedUsername = username || cleanEmail.split("@")[0] || `Dev_${Date.now().toString().slice(-4)}`;
      const randomPassword = `OAuth_${Math.random().toString(36).slice(-10)}!`;

      user = await User.create({
        username: generatedUsername,
        email: cleanEmail,
        password: randomPassword,
        avatar: avatar || "",
      });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Social Auth Error:", error.message);
    res.status(500).json({ error: "Social sign-in failed. Please try again." });
  }
});

// @route   GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// @route   PUT /api/auth/profile
// @desc    Update user profile username or email with validation
router.put("/profile", protect, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(cleanEmail)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
      }
      user.email = cleanEmail;
    }

    if (username) user.username = username.trim();

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
