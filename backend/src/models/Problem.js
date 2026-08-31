const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    default: "",
  },
  expectedOutput: {
    type: String,
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
});

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    category: {
      type: String,
      default: "Arrays & Hashing",
      index: true,
    },
    step: {
      type: String,
      default: "General",
      index: true,
    },
    sheets: {
      type: [String],
      default: ["striver-a2z", "love-babbar-450", "blind-75"],
      index: true,
    },
    externalUrl: {
      type: String,
      default: "https://leetcode.com/",
    },
    description: {
      type: String,
      required: true,
    },
    starterCode: {
      type: Map,
      of: String,
      default: {},
    },
    testCases: [testCaseSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Problem", problemSchema);
