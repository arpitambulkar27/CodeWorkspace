// backend/src/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    githubId: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/bottts/svg?seed=CodeFlow",
    },
  },
  { timestamps: true }
);

// Hash password before saving to DB (skips if password is missing or unmodified)
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
